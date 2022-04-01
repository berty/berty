#ifndef BOOST_NUMERIC_CONCEPT_NUMERIC_HPP
#define BOOST_NUMERIC_CONCEPT_NUMERIC_HPP

//  Copyright (c) 2012 Robert Ramey
//
// Distributed under the Boost Software License, Version 1.0. (See
// accompanying file LICENSE_1_0.txt or copy at
// http://www.boost.org/LICENSE_1_0.txt)

#include <limits>

namespace boost {
namespace safe_numerics {

template<class T>
struct Numeric {
    constexpr static bool value = std::numeric_limits<T>::is_specialized;
    constexpr operator bool (){
        return value;
    }
};

} // safe_numerics
} // boost

#endif // BOOST_NUMERIC_CONCEPT_NUMERIC_HPP
