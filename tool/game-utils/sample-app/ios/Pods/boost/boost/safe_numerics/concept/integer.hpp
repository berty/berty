#ifndef BOOST_NUMERIC_CONCEPT_INTEGER_HPP
#define BOOST_NUMERIC_CONCEPT_INTEGER_HPP

//  Copyright (c) 2012 Robert Ramey
//
// Distributed under the Boost Software License, Version 1.0. (See
// accompanying file LICENSE_1_0.txt or copy at
// http://www.boost.org/LICENSE_1_0.txt)

#include "numeric.hpp"

namespace boost {
namespace safe_numerics {

template <class T>
struct Integer : public Numeric<T> {
    constexpr static bool value =
        std::numeric_limits<T>::is_integer && Numeric<T>::value ;
    constexpr operator bool (){
        return value;
    }
};

} // safe_numerics
} // boost

#endif // BOOST_NUMERIC_CONCEPT_INTEGER_HPP
