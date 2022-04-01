// Boost.Geometry

// Copyright (c) 2020, Oracle and/or its affiliates.

// Contributed and/or modified by Adam Wulkiewicz, on behalf of Oracle

// Licensed under the Boost Software License version 1.0.
// http://www.boost.org/users/license.html

#ifndef BOOST_GEOMETRY_STRATEGIES_INDEX_CARTESIAN_HPP
#define BOOST_GEOMETRY_STRATEGIES_INDEX_CARTESIAN_HPP


// TODO: move to strategy directory
#include <boost/geometry/strategies/cartesian/distance_projected_point.hpp>
#include <boost/geometry/strategies/cartesian/distance_pythagoras.hpp>
#include <boost/geometry/strategies/cartesian/distance_segment_box.hpp>

#include <boost/geometry/strategies/index/services.hpp>
#include <boost/geometry/strategies/relate/cartesian.hpp>


namespace boost { namespace geometry { namespace strategies { namespace index
{

template <typename CalculationType = void>
class cartesian
    : public relate::cartesian<CalculationType>
{
public:
    template <typename Geometry1, typename Geometry2>
    static auto comparable_distance(Geometry1 const&, Geometry2 const&,
                                    std::enable_if_t
                                        <
                                            util::is_pointlike<Geometry1>::value
                                         && util::is_pointlike<Geometry2>::value
                                        > * = nullptr)
    {
        //return geometry::strategy::distance::comparable::pythagoras<CalculationType>();
        return geometry::strategy::distance::pythagoras<CalculationType>();
    }

    template <typename Geometry1, typename Geometry2>
    static auto comparable_distance(Geometry1 const&, Geometry2 const&,
                                    std::enable_if_t
                                        <
                                            (util::is_pointlike<Geometry1>::value
                                            && util::is_segment<Geometry2>::value)
                                         || (util::is_segment<Geometry1>::value
                                            && util::is_pointlike<Geometry2>::value)
                                        > * = nullptr)
    {
        return geometry::strategy::distance::projected_point
            <
                CalculationType,
                //geometry::strategy::distance::comparable::pythagoras<CalculationType>
                geometry::strategy::distance::pythagoras<CalculationType>
            >();
    }

    template <typename Geometry1, typename Geometry2>
    static auto comparable_distance(Geometry1 const&, Geometry2 const&,
                                    std::enable_if_t
                                        <
                                            (util::is_pointlike<Geometry1>::value
                                            && util::is_box<Geometry2>::value)
                                         || (util::is_box<Geometry1>::value
                                            && util::is_pointlike<Geometry2>::value)
                                        > * = nullptr)
    {
        //return geometry::strategy::distance::comparable::pythagoras_point_box<CalculationType>();
        return geometry::strategy::distance::pythagoras_point_box<CalculationType>();
    }

    template <typename Geometry1, typename Geometry2>
    static auto comparable_distance(Geometry1 const&, Geometry2 const&,
                                    std::enable_if_t
                                        <
                                            (util::is_segment<Geometry1>::value
                                            && util::is_box<Geometry2>::value)
                                         || (util::is_box<Geometry1>::value
                                             && util::is_segment<Geometry2>::value)
                                        > * = nullptr)
    {
        return geometry::strategy::distance::cartesian_segment_box
            <
                CalculationType,
                //geometry::strategy::distance::comparable::pythagoras<CalculationType>
                geometry::strategy::distance::pythagoras<CalculationType>
            >();
    }

    template <typename Geometry1, typename Geometry2>
    static auto comparable_distance(Geometry1 const&, Geometry2 const&,
                                    std::enable_if_t
                                        <
                                            util::is_segment<Geometry1>::value
                                         && util::is_segment<Geometry2>::value
                                        > * = nullptr)
    {
        return strategy::distance::projected_point
            <
                CalculationType,
                //strategy::distance::comparable::pythagoras<CalculationType>
                strategy::distance::pythagoras<CalculationType>
            >();
    }
};


namespace services
{

template <typename Geometry>
struct default_strategy<Geometry, cartesian_tag>
{
    using type = strategies::index::cartesian<>;
};


// TEMP - needed in distance until umbrella strategies are supported
template <typename CalculationType, typename SubStrategy>
struct strategy_converter<strategy::distance::projected_point<CalculationType, SubStrategy>>
{
    static auto get(strategy::distance::projected_point<CalculationType, SubStrategy> const& )
    {
        return strategies::index::cartesian<CalculationType>();
    }
};
// TEMP - needed in distance until umbrella strategies are supported
template <typename CalculationType>
struct strategy_converter<strategy::distance::comparable::pythagoras<CalculationType>>
{
    static auto get(strategy::distance::comparable::pythagoras<CalculationType> const&)
    {
        return strategies::index::cartesian<CalculationType>();
    }
};


} // namespace services


}}}} // namespace boost::geometry::strategy::index

#endif // BOOST_GEOMETRY_STRATEGIES_INDEX_CARTESIAN_HPP
