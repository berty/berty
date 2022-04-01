
//  Copyright (c) 2011 John Maddock
//  Use, modification and distribution are subject to the
//  Boost Software License, Version 1.0. (See accompanying file
//  LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)

#ifndef BOOST_MP_BIG_LANCZOS
#define BOOST_MP_BIG_LANCZOS

#include <boost/math/bindings/detail/big_lanczos.hpp>

namespace boost {
namespace math {

namespace lanczos {

template <class T, class Policy>
struct lanczos;

template <class Backend, boost::multiprecision::expression_template_option ExpressionTemplates, class Policy>
struct lanczos<multiprecision::number<Backend, ExpressionTemplates>, Policy>
{
   using precision_type = typename boost::math::policies::precision<multiprecision::number<Backend, ExpressionTemplates>, Policy>::type;
   using type = typename std::conditional<
       precision_type::value && (precision_type::value <= 73),
       lanczos13UDT,
       typename std::conditional<
           precision_type::value && (precision_type::value <= 122),
           lanczos22UDT,
           undefined_lanczos>::type>::type;
};

}

}} // namespace boost::math::lanczos

#endif
