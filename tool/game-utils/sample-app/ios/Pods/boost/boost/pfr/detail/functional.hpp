// Copyright (c) 2016-2021 Antony Polukhin
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

#ifndef BOOST_PFR_DETAIL_FUNCTIONAL_HPP
#define BOOST_PFR_DETAIL_FUNCTIONAL_HPP
#pragma once

#include <boost/pfr/detail/config.hpp>

#include <functional>

#include <boost/pfr/detail/sequence_tuple.hpp>

namespace boost { namespace pfr { namespace detail {
    template <std::size_t I, std::size_t N>
    struct equal_impl {
        template <class T, class U>
        constexpr static bool cmp(const T& v1, const U& v2) noexcept {
            return ::boost::pfr::detail::sequence_tuple::get<I>(v1) == ::boost::pfr::detail::sequence_tuple::get<I>(v2)
                && equal_impl<I + 1, N>::cmp(v1, v2);
        }
    };

    template <std::size_t N>
    struct equal_impl<N, N> {
        template <class T, class U>
        constexpr static bool cmp(const T&, const U&) noexcept {
            return T::size_v == U::size_v;
        }
    };

    template <std::size_t I, std::size_t N>
    struct not_equal_impl {
        template <class T, class U>
        constexpr static bool cmp(const T& v1, const U& v2) noexcept {
            return ::boost::pfr::detail::sequence_tuple::get<I>(v1) != ::boost::pfr::detail::sequence_tuple::get<I>(v2)
                || not_equal_impl<I + 1, N>::cmp(v1, v2);
        }
    };

    template <std::size_t N>
    struct not_equal_impl<N, N> {
        template <class T, class U>
        constexpr static bool cmp(const T&, const U&) noexcept {
            return T::size_v != U::size_v;
        }
    };

    template <std::size_t I, std::size_t N>
    struct less_impl {
        template <class T, class U>
        constexpr static bool cmp(const T& v1, const U& v2) noexcept {
            return sequence_tuple::get<I>(v1) < sequence_tuple::get<I>(v2)
                || (sequence_tuple::get<I>(v1) == sequence_tuple::get<I>(v2) && less_impl<I + 1, N>::cmp(v1, v2));
        }
    };

    template <std::size_t N>
    struct less_impl<N, N> {
        template <class T, class U>
        constexpr static bool cmp(const T&, const U&) noexcept {
            return T::size_v < U::size_v;
        }
    };

    template <std::size_t I, std::size_t N>
    struct less_equal_impl {
        template <class T, class U>
        constexpr static bool cmp(const T& v1, const U& v2) noexcept {
            return sequence_tuple::get<I>(v1) < sequence_tuple::get<I>(v2)
                || (sequence_tuple::get<I>(v1) == sequence_tuple::get<I>(v2) && less_equal_impl<I + 1, N>::cmp(v1, v2));
        }
    };

    template <std::size_t N>
    struct less_equal_impl<N, N> {
        template <class T, class U>
        constexpr static bool cmp(const T&, const U&) noexcept {
            return T::size_v <= U::size_v;
        }
    };

    template <std::size_t I, std::size_t N>
    struct greater_impl {
        template <class T, class U>
        constexpr static bool cmp(const T& v1, const U& v2) noexcept {
            return sequence_tuple::get<I>(v1) > sequence_tuple::get<I>(v2)
                || (sequence_tuple::get<I>(v1) == sequence_tuple::get<I>(v2) && greater_impl<I + 1, N>::cmp(v1, v2));
        }
    };

    template <std::size_t N>
    struct greater_impl<N, N> {
        template <class T, class U>
        constexpr static bool cmp(const T&, const U&) noexcept {
            return T::size_v > U::size_v;
        }
    };

    template <std::size_t I, std::size_t N>
    struct greater_equal_impl {
        template <class T, class U>
        constexpr static bool cmp(const T& v1, const U& v2) noexcept {
            return sequence_tuple::get<I>(v1) > sequence_tuple::get<I>(v2)
                || (sequence_tuple::get<I>(v1) == sequence_tuple::get<I>(v2) && greater_equal_impl<I + 1, N>::cmp(v1, v2));
        }
    };

    template <std::size_t N>
    struct greater_equal_impl<N, N> {
        template <class T, class U>
        constexpr static bool cmp(const T&, const U&) noexcept {
            return T::size_v >= U::size_v;
        }
    };

    template <typename SizeT>
    constexpr void hash_combine(SizeT& seed, SizeT value) noexcept {
        seed ^= value + 0x9e3779b9 + (seed<<6) + (seed>>2);
    }

    template <typename T>
    auto compute_hash(const T& value, long /*priority*/)
        -> decltype(std::hash<T>()(value))
    {
        return std::hash<T>()(value);
    }

    template <typename T>
    std::size_t compute_hash(const T& /*value*/, int /*priority*/) {
        static_assert(sizeof(T) && false, "====================> Boost.PFR: std::hash not specialized for type T");
        return 0;
    }

    template <std::size_t I, std::size_t N>
    struct hash_impl {
        template <class T>
        constexpr static std::size_t compute(const T& val) noexcept {
            std::size_t h = detail::compute_hash( ::boost::pfr::detail::sequence_tuple::get<I>(val), 1L );
            detail::hash_combine(h, hash_impl<I + 1, N>::compute(val) );
            return h;
        }
    };

    template <std::size_t N>
    struct hash_impl<N, N> {
        template <class T>
        constexpr static std::size_t compute(const T&) noexcept {
            return 0;
        }
    };

///////////////////// Define min_element and to avoid inclusion of <algorithm>
    constexpr std::size_t min_size(std::size_t x, std::size_t y) noexcept {
        return x < y ? x : y;
    }

    template <template <std::size_t, std::size_t> class Visitor, class T, class U>
    constexpr bool binary_visit(const T& x, const U& y) {
        constexpr std::size_t fields_count_lhs = detail::fields_count<std::remove_reference_t<T>>();
        constexpr std::size_t fields_count_rhs = detail::fields_count<std::remove_reference_t<U>>();
        constexpr std::size_t fields_count_min = detail::min_size(fields_count_lhs, fields_count_rhs);
        typedef Visitor<0, fields_count_min> visitor_t;

#if BOOST_PFR_USE_CPP17 || BOOST_PFR_USE_LOOPHOLE
        return visitor_t::cmp(detail::tie_as_tuple(x), detail::tie_as_tuple(y));
#else
        bool result = true;
        ::boost::pfr::detail::for_each_field_dispatcher(
            x,
            [&result, &y](const auto& lhs) {
                ::boost::pfr::detail::for_each_field_dispatcher(
                    y,
                    [&result, &lhs](const auto& rhs) {
                        result = visitor_t::cmp(lhs, rhs);
                    },
                    detail::make_index_sequence<fields_count_rhs>{}
                );
            },
            detail::make_index_sequence<fields_count_lhs>{}
        );

        return result;
#endif
    }

}}} // namespace boost::pfr::detail

#endif // BOOST_PFR_DETAIL_FUNCTIONAL_HPP
