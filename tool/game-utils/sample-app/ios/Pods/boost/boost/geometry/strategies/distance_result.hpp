// Boost.Geometry (aka GGL, Generic Geometry Library)

// Copyright (c) 2007-2015 Barend Gehrels, Amsterdam, the Netherlands.
// Copyright (c) 2008-2015 Bruno Lalande, Paris, France.
// Copyright (c) 2009-2015 Mateusz Loskot, London, UK.
// Copyright (c) 2013-2015 Adam Wulkiewicz, Lodz, Poland.
// Copyright (c) 2014-2015 Samuel Debionne, Grenoble, France.

// This file was modified by Oracle on 2014-2020.
// Modifications copyright (c) 2014-2020, Oracle and/or its affiliates.

// Contributed and/or modified by Menelaos Karavelas, on behalf of Oracle
// Contributed and/or modified by Adam Wulkiewicz, on behalf of Oracle

// Parts of Boost.Geometry are redesigned from Geodan's Geographic Library
// (geolib/GGL), copyright (c) 1995-2010 Geodan, Amsterdam, the Netherlands.

// Use, modification and distribution is subject to the Boost Software License,
// Version 1.0. (See accompanying file LICENSE_1_0.txt or copy at
// http://www.boost.org/LICENSE_1_0.txt)

#ifndef BOOST_GEOMETRY_STRATEGIES_DISTANCE_RESULT_HPP
#define BOOST_GEOMETRY_STRATEGIES_DISTANCE_RESULT_HPP

#include <boost/variant/variant_fwd.hpp>

#include <boost/geometry/algorithms/detail/distance/default_strategies.hpp>
#include <boost/geometry/core/point_type.hpp>
#include <boost/geometry/strategies/default_strategy.hpp>
#include <boost/geometry/strategies/distance.hpp>
#include <boost/geometry/util/select_most_precise.hpp>
#include <boost/geometry/util/sequence.hpp>
#include <boost/geometry/util/type_traits.hpp>

namespace boost { namespace geometry
{


namespace resolve_strategy
{

template
<
    typename Geometry1, typename Geometry2, typename Strategy,
    bool AreGeometries = (util::is_geometry<Geometry1>::value
                       && util::is_geometry<Geometry2>::value)
>
struct distance_result
    : strategy::distance::services::return_type
        <
            Strategy,
            typename point_type<Geometry1>::type,
            typename point_type<Geometry2>::type
        >
{};

template <typename Geometry1, typename Geometry2, bool AreGeometries>
struct distance_result<Geometry1, Geometry2, default_strategy, AreGeometries>
    : distance_result
        <
            Geometry1,
            Geometry2,
            typename detail::distance::default_strategy
                <
                    Geometry1, Geometry2
                >::type
        >
{};


// Workaround for VS2015
#if defined(_MSC_VER) && (_MSC_VER < 1910)
template <typename Geometry1, typename Geometry2, typename Strategy>
struct distance_result<Geometry1, Geometry2, Strategy, false>
{
    typedef int type;
};
template <typename Geometry1, typename Geometry2>
struct distance_result<Geometry1, Geometry2, default_strategy, false>
{
    typedef int type;
};
#endif


} // namespace resolve_strategy


#ifndef DOXYGEN_NO_DETAIL
namespace detail { namespace distance
{

template <typename Strategy = geometry::default_strategy>
struct more_precise_distance_result
{
    template <typename Curr, typename Next>
    struct predicate
        : std::is_same
            <
                typename resolve_strategy::distance_result
                    <
                        typename util::sequence_element<0, Curr>::type,
                        typename util::sequence_element<1, Curr>::type,
                        Strategy
                    >::type,
                typename geometry::select_most_precise
                    <
                        typename resolve_strategy::distance_result
                            <
                                typename util::sequence_element<0, Curr>::type,
                                typename util::sequence_element<1, Curr>::type,
                                Strategy
                            >::type,
                        typename resolve_strategy::distance_result
                            <
                                typename util::sequence_element<0, Next>::type,
                                typename util::sequence_element<1, Next>::type,
                                Strategy
                            >::type
                    >::type
            >
    {};
};

}} // namespace detail::distance
#endif //DOXYGEN_NO_DETAIL


namespace resolve_variant
{

template <typename Geometry1, typename Geometry2, typename Strategy>
struct distance_result
    : resolve_strategy::distance_result
        <
            Geometry1,
            Geometry2,
            Strategy
        >
{};


template
<
    typename Geometry1,
    BOOST_VARIANT_ENUM_PARAMS(typename T),
    typename Strategy
>
struct distance_result
    <
        Geometry1, boost::variant<BOOST_VARIANT_ENUM_PARAMS(T)>, Strategy
    >
{
    // Select the most precise distance strategy result type
    //   for all variant type combinations.
    // TODO: We should ignore the combinations that are not valid
    //   but is_implemented is not ready for prime time.
    typedef typename util::select_combination_element
        <
            util::type_sequence<Geometry1>,
            util::type_sequence<BOOST_VARIANT_ENUM_PARAMS(T)>,
            detail::distance::more_precise_distance_result<Strategy>::template predicate
        >::type elements;

    typedef typename resolve_strategy::distance_result
        <
            typename util::sequence_element<0, elements>::type,
            typename util::sequence_element<1, elements>::type,
            Strategy
        >::type type;
};


// Distance arguments are commutative
template
<
    BOOST_VARIANT_ENUM_PARAMS(typename T),
    typename Geometry2,
    typename Strategy
>
struct distance_result
    <
        boost::variant<BOOST_VARIANT_ENUM_PARAMS(T)>, Geometry2, Strategy
    >
    : public distance_result
        <
            Geometry2, boost::variant<BOOST_VARIANT_ENUM_PARAMS(T)>, Strategy
        >
{};


template
<
    BOOST_VARIANT_ENUM_PARAMS(typename T),
    BOOST_VARIANT_ENUM_PARAMS(typename U),
    typename Strategy
>
struct distance_result
    <
        boost::variant<BOOST_VARIANT_ENUM_PARAMS(T)>,
        boost::variant<BOOST_VARIANT_ENUM_PARAMS(U)>,
        Strategy
    >
{
    // Select the most precise distance strategy result type
    //   for all variant type combinations.
    // TODO: We should ignore the combinations that are not valid
    //   but is_implemented is not ready for prime time.
    typedef typename util::select_combination_element
        <
            util::type_sequence<BOOST_VARIANT_ENUM_PARAMS(T)>,
            util::type_sequence<BOOST_VARIANT_ENUM_PARAMS(U)>,
            detail::distance::more_precise_distance_result<Strategy>::template predicate
        >::type elements;

    typedef typename resolve_strategy::distance_result
        <
            typename util::sequence_element<0, elements>::type,
            typename util::sequence_element<1, elements>::type,
            Strategy
        >::type type;
};

} // namespace resolve_variant


/*!
\brief Meta-function defining return type of distance function
\ingroup distance
\note The strategy defines the return-type (so this situation is different
    from length, where distance is sqr/sqrt, but length always squared)
 */
template
<
    typename Geometry1,
    typename Geometry2 = Geometry1,
    typename Strategy = void
>
struct distance_result
    : resolve_variant::distance_result<Geometry1, Geometry2, Strategy>
{};


template <typename Geometry1, typename Geometry2>
struct distance_result<Geometry1, Geometry2, void>
    : distance_result<Geometry1, Geometry2, default_strategy>
{};


}} // namespace boost::geometry


#endif // BOOST_GEOMETRY_STRATEGIES_DISTANCE_RESULT_HPP
