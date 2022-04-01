//
//  Copyright (c) 2015 Artyom Beilis (Tonkikh)
//  Copyright (c) 2020 Alexander Grund
//
//  Distributed under the Boost Software License, Version 1.0. (See
//  accompanying file LICENSE or copy at
//  http://www.boost.org/LICENSE_1_0.txt)
//
#ifndef BOOST_NOWIDE_UTF8_CODECVT_HPP_INCLUDED
#define BOOST_NOWIDE_UTF8_CODECVT_HPP_INCLUDED

#include <boost/nowide/replacement.hpp>
#include <boost/nowide/utf/utf.hpp>
#include <cstdint>
#include <locale>

namespace boost {
namespace nowide {

    static_assert(sizeof(std::mbstate_t) >= 2, "mbstate_t is to small to store an UTF-16 codepoint");
    namespace detail {
        // Avoid including cstring for std::memcpy
        inline void copy_uint16_t(void* dst, const void* src)
        {
            unsigned char* cdst = static_cast<unsigned char*>(dst);
            const unsigned char* csrc = static_cast<const unsigned char*>(src);
            cdst[0] = csrc[0];
            cdst[1] = csrc[1];
        }
        inline std::uint16_t read_state(const std::mbstate_t& src)
        {
            std::uint16_t dst;
            copy_uint16_t(&dst, &src);
            return dst;
        }
        inline void write_state(std::mbstate_t& dst, const std::uint16_t src)
        {
            copy_uint16_t(&dst, &src);
        }
    } // namespace detail

#if defined _MSC_VER && _MSC_VER < 1700
// MSVC do_length is non-standard it counts wide characters instead of narrow and does not change mbstate
#define BOOST_NOWIDE_DO_LENGTH_MBSTATE_CONST
#endif

    /// std::codecvt implementation that converts between UTF-8 and UTF-16 or UTF-32
    ///
    /// @tparam CharSize Determines the encoding: 2 for UTF-16, 4 for UTF-32
    ///
    /// Invalid sequences are replaced by #BOOST_NOWIDE_REPLACEMENT_CHARACTER
    /// A trailing incomplete sequence will result in a return value of std::codecvt::partial
    template<typename CharType, int CharSize = sizeof(CharType)>
    class utf8_codecvt;

    /// Specialization for the UTF-8 <-> UTF-16 variant of the std::codecvt implementation
    template<typename CharType>
    class BOOST_SYMBOL_VISIBLE utf8_codecvt<CharType, 2> : public std::codecvt<CharType, char, std::mbstate_t>
    {
    public:
        static_assert(sizeof(CharType) >= 2, "CharType must be able to store UTF16 code point");

        utf8_codecvt(size_t refs = 0) : std::codecvt<CharType, char, std::mbstate_t>(refs)
        {}

    protected:
        using uchar = CharType;

        std::codecvt_base::result do_unshift(std::mbstate_t& s, char* from, char* /*to*/, char*& next) const override
        {
            if(detail::read_state(s) != 0)
                return std::codecvt_base::error;
            next = from;
            return std::codecvt_base::ok;
        }
        int do_encoding() const noexcept override
        {
            return 0;
        }
        int do_max_length() const noexcept override
        {
            return 4;
        }
        bool do_always_noconv() const noexcept override
        {
            return false;
        }

        int do_length(std::mbstate_t
#ifdef BOOST_NOWIDE_DO_LENGTH_MBSTATE_CONST
                      const
#endif
                        & std_state,
                      const char* from,
                      const char* from_end,
                      size_t max) const override
        {
            std::uint16_t state = detail::read_state(std_state);
#ifndef BOOST_NOWIDE_DO_LENGTH_MBSTATE_CONST
            const char* save_from = from;
#else
            size_t save_max = max;
#endif
            while(max > 0 && from < from_end)
            {
                const char* prev_from = from;
                std::uint32_t ch = utf::utf_traits<char>::decode(from, from_end);
                if(ch == utf::illegal)
                {
                    ch = BOOST_NOWIDE_REPLACEMENT_CHARACTER;
                } else if(ch == utf::incomplete)
                {
                    from = prev_from;
                    break;
                }
                max--;
                if(ch > 0xFFFF)
                {
                    if(state == 0)
                    {
                        from = prev_from;
                        state = 1;
                    } else
                    {
                        state = 0;
                    }
                }
            }
#ifndef BOOST_NOWIDE_DO_LENGTH_MBSTATE_CONST
            detail::write_state(std_state, state);
            return static_cast<int>(from - save_from);
#else
            return static_cast<int>(save_max - max);
#endif
        }

        std::codecvt_base::result do_in(std::mbstate_t& std_state,
                                        const char* from,
                                        const char* from_end,
                                        const char*& from_next,
                                        uchar* to,
                                        uchar* to_end,
                                        uchar*& to_next) const override
        {
            std::codecvt_base::result r = std::codecvt_base::ok;

            // mbstate_t is POD type and should be initialized to 0 (i.a. state = stateT())
            // according to standard. We use it to keep a flag 0/1 for surrogate pair writing
            //
            // if 0 no code above >0xFFFF observed, of 1 a code above 0xFFFF observed
            // and first pair is written, but no input consumed
            std::uint16_t state = detail::read_state(std_state);
            while(to < to_end && from < from_end)
            {
                const char* from_saved = from;

                uint32_t ch = utf::utf_traits<char>::decode(from, from_end);

                if(ch == utf::illegal)
                {
                    ch = BOOST_NOWIDE_REPLACEMENT_CHARACTER;
                } else if(ch == utf::incomplete)
                {
                    from = from_saved;
                    r = std::codecvt_base::partial;
                    break;
                }
                // Normal codepoints go directly to stream
                if(ch <= 0xFFFF)
                {
                    *to++ = static_cast<CharType>(ch);
                } else
                {
                    // for  other codepoints we do following
                    //
                    // 1. We can't consume our input as we may find ourself
                    //    in state where all input consumed but not all output written,i.e. only
                    //    1st pair is written
                    // 2. We only write first pair and mark this in the state, we also revert back
                    //    the from pointer in order to make sure this codepoint would be read
                    //    once again and then we would consume our input together with writing
                    //    second surrogate pair
                    ch -= 0x10000;
                    std::uint16_t vh = static_cast<std::uint16_t>(ch >> 10);
                    std::uint16_t vl = ch & 0x3FF;
                    std::uint16_t w1 = vh + 0xD800;
                    std::uint16_t w2 = vl + 0xDC00;
                    if(state == 0)
                    {
                        from = from_saved;
                        *to++ = static_cast<CharType>(w1);
                        state = 1;
                    } else
                    {
                        *to++ = static_cast<CharType>(w2);
                        state = 0;
                    }
                }
            }
            from_next = from;
            to_next = to;
            if(r == std::codecvt_base::ok && (from != from_end || state != 0))
                r = std::codecvt_base::partial;
            detail::write_state(std_state, state);
            return r;
        }

        std::codecvt_base::result do_out(std::mbstate_t& std_state,
                                         const uchar* from,
                                         const uchar* from_end,
                                         const uchar*& from_next,
                                         char* to,
                                         char* to_end,
                                         char*& to_next) const override
        {
            std::codecvt_base::result r = std::codecvt_base::ok;
            // mbstate_t is POD type and should be initialized to 0 (i.a. state = stateT())
            // according to standard. We assume that sizeof(mbstate_t) >=2 in order
            // to be able to store first observed surrogate pair
            //
            // State: state!=0 - a first surrogate pair was observed (state = first pair),
            // we expect the second one to come and then zero the state
            ///
            std::uint16_t state = detail::read_state(std_state);
            while(to < to_end && from < from_end)
            {
                std::uint32_t ch = 0;
                if(state != 0)
                {
                    // if the state indicates that 1st surrogate pair was written
                    // we should make sure that the second one that comes is actually
                    // second surrogate
                    std::uint16_t w1 = state;
                    std::uint16_t w2 = *from;
                    // we don't forward from as writing may fail to incomplete or
                    // partial conversion
                    if(0xDC00 <= w2 && w2 <= 0xDFFF)
                    {
                        std::uint16_t vh = w1 - 0xD800;
                        std::uint16_t vl = w2 - 0xDC00;
                        ch = ((uint32_t(vh) << 10) | vl) + 0x10000;
                    } else
                    {
                        ch = BOOST_NOWIDE_REPLACEMENT_CHARACTER;
                    }
                } else
                {
                    ch = *from;
                    if(0xD800 <= ch && ch <= 0xDBFF)
                    {
                        // if this is a first surrogate pair we put
                        // it into the state and consume it, note we don't
                        // go forward as it should be illegal so we increase
                        // the from pointer manually
                        state = static_cast<std::uint16_t>(ch);
                        from++;
                        continue;
                    } else if(0xDC00 <= ch && ch <= 0xDFFF)
                    {
                        // if we observe second surrogate pair and
                        // first only may be expected we should break from the loop with error
                        // as it is illegal input
                        ch = BOOST_NOWIDE_REPLACEMENT_CHARACTER;
                    }
                }
                if(!utf::is_valid_codepoint(ch))
                {
                    r = std::codecvt_base::error;
                    break;
                }
                int len = utf::utf_traits<char>::width(ch);
                if(to_end - to < len)
                {
                    r = std::codecvt_base::partial;
                    break;
                }
                to = utf::utf_traits<char>::encode(ch, to);
                state = 0;
                from++;
            }
            from_next = from;
            to_next = to;
            if(r == std::codecvt_base::ok && (from != from_end || state != 0))
                r = std::codecvt_base::partial;
            detail::write_state(std_state, state);
            return r;
        }
    };

    /// Specialization for the UTF-8 <-> UTF-32 variant of the std::codecvt implementation
    template<typename CharType>
    class BOOST_SYMBOL_VISIBLE utf8_codecvt<CharType, 4> : public std::codecvt<CharType, char, std::mbstate_t>
    {
    public:
        utf8_codecvt(size_t refs = 0) : std::codecvt<CharType, char, std::mbstate_t>(refs)
        {}

    protected:
        using uchar = CharType;

        std::codecvt_base::result
        do_unshift(std::mbstate_t& /*s*/, char* from, char* /*to*/, char*& next) const override
        {
            next = from;
            return std::codecvt_base::ok;
        }
        int do_encoding() const noexcept override
        {
            return 0;
        }
        int do_max_length() const noexcept override
        {
            return 4;
        }
        bool do_always_noconv() const noexcept override
        {
            return false;
        }

        int do_length(std::mbstate_t
#ifdef BOOST_NOWIDE_DO_LENGTH_MBSTATE_CONST
                      const
#endif
                        & /*state*/,
                      const char* from,
                      const char* from_end,
                      size_t max) const override
        {
#ifndef BOOST_NOWIDE_DO_LENGTH_MBSTATE_CONST
            const char* start_from = from;
#else
            size_t save_max = max;
#endif

            while(max > 0 && from < from_end)
            {
                const char* save_from = from;
                std::uint32_t ch = utf::utf_traits<char>::decode(from, from_end);
                if(ch == utf::incomplete)
                {
                    from = save_from;
                    break;
                } else if(ch == utf::illegal)
                {
                    ch = BOOST_NOWIDE_REPLACEMENT_CHARACTER;
                }
                max--;
            }
#ifndef BOOST_NOWIDE_DO_LENGTH_MBSTATE_CONST
            return from - start_from;
#else
            return save_max - max;
#endif
        }

        std::codecvt_base::result do_in(std::mbstate_t& /*state*/,
                                        const char* from,
                                        const char* from_end,
                                        const char*& from_next,
                                        uchar* to,
                                        uchar* to_end,
                                        uchar*& to_next) const override
        {
            std::codecvt_base::result r = std::codecvt_base::ok;

            while(to < to_end && from < from_end)
            {
                const char* from_saved = from;

                uint32_t ch = utf::utf_traits<char>::decode(from, from_end);

                if(ch == utf::illegal)
                {
                    ch = BOOST_NOWIDE_REPLACEMENT_CHARACTER;
                } else if(ch == utf::incomplete)
                {
                    r = std::codecvt_base::partial;
                    from = from_saved;
                    break;
                }
                *to++ = ch;
            }
            from_next = from;
            to_next = to;
            if(r == std::codecvt_base::ok && from != from_end)
                r = std::codecvt_base::partial;
            return r;
        }

        std::codecvt_base::result do_out(std::mbstate_t& /*std_state*/,
                                         const uchar* from,
                                         const uchar* from_end,
                                         const uchar*& from_next,
                                         char* to,
                                         char* to_end,
                                         char*& to_next) const override
        {
            std::codecvt_base::result r = std::codecvt_base::ok;
            while(to < to_end && from < from_end)
            {
                std::uint32_t ch = 0;
                ch = *from;
                if(!utf::is_valid_codepoint(ch))
                {
                    ch = BOOST_NOWIDE_REPLACEMENT_CHARACTER;
                }
                int len = utf::utf_traits<char>::width(ch);
                if(to_end - to < len)
                {
                    r = std::codecvt_base::partial;
                    break;
                }
                to = utf::utf_traits<char>::encode(ch, to);
                from++;
            }
            from_next = from;
            to_next = to;
            if(r == std::codecvt_base::ok && from != from_end)
                r = std::codecvt_base::partial;
            return r;
        }
    };

} // namespace nowide
} // namespace boost

#endif
