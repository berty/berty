//
// Copyright (c) 2019 Vinnie Falco (vinnie.falco@gmail.com)
// Copyright (c) 2020 Krystian Stasiowski (sdkrystian@gmail.com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//
// Official repository: https://github.com/boostorg/json
//

#ifndef BOOST_JSON_DETAIL_VALUE_TO_HPP
#define BOOST_JSON_DETAIL_VALUE_TO_HPP

#include <boost/json/value.hpp>
#include <boost/json/detail/value_traits.hpp>

#include <type_traits>

BOOST_JSON_NS_BEGIN

template<class>
struct value_to_tag { };

template<class, class = void>
struct has_value_to;

template<class T, class U,
    typename std::enable_if<
        ! std::is_reference<T>::value &&
    std::is_same<U, value>::value>::type>
T value_to(U const&);

namespace detail {

//----------------------------------------------------------
// Use native conversion

// identity conversion
inline
value
tag_invoke(
    value_to_tag<value>,
    value const& jv)
{
    return jv;
}

// object
inline
object
tag_invoke(
    value_to_tag<object>,
    value const& jv)
{
    return jv.as_object();
}

// array
inline
array
tag_invoke(
    value_to_tag<array>,
    value const& jv)
{
    return jv.as_array();
}

// string
inline
string
tag_invoke(
    value_to_tag<string>,
    value const& jv)
{
    return jv.as_string();
}

// bool
inline
bool
tag_invoke(
    value_to_tag<bool>,
    value const& jv)
{
    return jv.as_bool();
}

// integral and floating point
template<class T, typename std::enable_if<
    std::is_arithmetic<T>::value>::type* = nullptr>
T
tag_invoke(
    value_to_tag<T>,
    value const& jv)
{
    return jv.to_number<T>();
}

//----------------------------------------------------------
// Use generic conversion

// string-like types
// NOTE: original check for size used is_convertible but
// MSVC-140 selects wrong specialisation if used
template<class T, typename std::enable_if<
    std::is_constructible<T, const char*, std::size_t>::value &&
    std::is_convertible<decltype(std::declval<T&>().data()), const char*>::value &&
    std::is_integral<decltype(std::declval<T&>().size())>::value
>::type* = nullptr>
T
value_to_generic(
    const value& jv,
    priority_tag<2>)
{
    auto& str = jv.as_string();
    return T(str.data(), str.size());
}

// map like containers
template<class T, typename std::enable_if<
    has_value_to<typename map_traits<T>::pair_value_type>::value &&
        std::is_constructible<typename map_traits<T>::pair_key_type,
    string_view>::value>::type* = nullptr>
T
value_to_generic(
    const value& jv,
    priority_tag<1>)
{
    using value_type = typename
        container_traits<T>::value_type;
    const object& obj = jv.as_object();
    T result;
    container_traits<T>::try_reserve(
        result, obj.size());
    for (const auto& val : obj)
        result.insert(value_type{typename map_traits<T>::
            pair_key_type(val.key()), value_to<typename
                map_traits<T>::pair_value_type>(val.value())});
    return result;
}

// all other containers
template<class T, typename std::enable_if<
    has_value_to<typename container_traits<T>::
        value_type>::value>::type* = nullptr>
T
value_to_generic(
    const value& jv,
    priority_tag<0>)
{
    const array& arr = jv.as_array();
    T result;
    container_traits<T>::try_reserve(
        result, arr.size());
    for (const auto& val : arr)
        result.insert(end(result), value_to<typename
            container_traits<T>::value_type>(val));
    return result;
}

// Matches containers
template<class T, void_t<typename std::enable_if<
    !std::is_constructible<T, const value&>::value &&
        !std::is_arithmetic<T>::value>::type, decltype(
    value_to_generic<T>(std::declval<const value&>(),
        priority_tag<2>()))>* = nullptr>
T
tag_invoke(
    value_to_tag<T>,
    value const& jv)
{
    return value_to_generic<T>(
        jv, priority_tag<2>());
}

//----------------------------------------------------------

// Calls to value_to are forwarded to this function
// so we can use ADL and hide the built-in tag_invoke
// overloads in the detail namespace
template<class T, void_t<
    decltype(tag_invoke(std::declval<value_to_tag<T>&>(),
        std::declval<const value&>()))>* = nullptr>
T
value_to_impl(
    value_to_tag<T> tag,
    value const& jv)
{
    return tag_invoke(tag, jv);
}

} // detail
BOOST_JSON_NS_END

#endif
