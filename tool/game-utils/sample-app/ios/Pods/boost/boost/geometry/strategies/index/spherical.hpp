// Boost.Geometry

// Copyright (c) 2020, Oracle and/or its affiliates.

// Contributed and/or modified by Adam Wulkiewicz, on behalf of Oracle

// Licensed under the Boost Software License version 1.0.
// http://www.boost.org/users/license.html

#ifndef BOOST_GEOMETRY_STRATEGIES_INDEX_SPHERICAL_HPP
#define BOOST_GEOMETRY_STRATEGIES_INDEX_SPHERICAL_HPP


// TEMP - move to strategy
#include <boost/geometry/strategies/spherical/distance_cross_track.hpp>
#include <boost/geometry/strategies/spherical/distance_cross_track_point_box.hpp>
#include <boost/geometry/strategies/spherical/distance_haversine.hpp>
#include <boost/geometry/strategies/spherical/distance_segment_box.hpp>

#include <boost/geometry/strategies/index/services.hpp>
#include <boost/geometry/strategies/relate/spherical.hpp>


namespace boost { namespace geometry
{

namespace strategies { namespace index
{

#ifndef DOXYGEN_NO_DETAIL
namespace detail
{

template <typename RadiusTypeOrSphere, typename CalculationType>
class spherical
    : public strategies::relate::detail::spherical<RadiusTypeOrSphere, CalculationType>
{
    using base_t = strategies::relate::detail::spherical<RadiusTypeOrSphere, CalculationType>;

public:
    template <typename Geometry1, typename Geometry2>
    auto comparable_distance(Geometry1 const&, Geometry2 const&,
                             std::enable_if_t
                                <
                                    util::is_pointlike<Geometry1>::value
                                    && util::is_pointlike<Geometry2>::value
                                > * = nullptr) const
    {
        //return geometry::strategy::distance::comparable::haversine
        return geometry::strategy::distance::haversine
            <
                typename base_t::radius_type, CalculationType
            >(base_t::radius());
    }

    template <typename Geometry1, typename Geometry2>
    auto comparable_distance(Geometry1 const&, Geometry2 const&,
                             std::enable_if_t
                                <
                                    (util::is_pointlike<Geometry1>::value
                                    && util::is_segment<Geometry2>::value)
                                    || (util::is_segment<Geometry1>::value
                                    && util::is_pointlike<Geometry2>::value)
                                > * = nullptr) const
    {
        //return geometry::strategy::distance::comparable::cross_track
        return geometry::strategy::distance::cross_track
            <
                CalculationType,
                //geometry::strategy::distance::comparable::haversine
                geometry::strategy::distance::haversine
                    <
                        typename base_t::radius_type, CalculationType
                    >
            >(base_t::radius());
    }

    template <typename Geometry1, typename Geometry2>
    auto comparable_distance(Geometry1 const&, Geometry2 const&,
                             std::enable_if_t
                                <
                                    (util::is_pointlike<Geometry1>::value
                                    && util::is_box<Geometry2>::value)
                                    || (util::is_box<Geometry1>::value
                                    && util::is_pointlike<Geometry2>::value)
                                > * = nullptr) const
    {
        //return geometry::strategy::distance::comparable::cross_track_point_box
        return geometry::strategy::distance::cross_track_point_box
            <
                CalculationType,
                //geometry::strategy::distance::comparable::haversine
                geometry::strategy::distance::haversine
                    <
                        typename base_t::radius_type, CalculationType
                    >
            >(base_t::radius());
    }

    template <typename Geometry1, typename Geometry2>
    auto comparable_distance(Geometry1 const&, Geometry2 const&,
                             std::enable_if_t
                                <
                                    (util::is_segment<Geometry1>::value
                                    && util::is_box<Geometry2>::value)
                                    || (util::is_box<Geometry1>::value
                                        && util::is_segment<Geometry2>::value)
                                > * = nullptr) const
    {
        return geometry::strategy::distance::spherical_segment_box
            <
                CalculationType,
                //geometry::strategy::distance::comparable::haversine
                geometry::strategy::distance::haversine
                    <
                        typename base_t::radius_type, CalculationType
                    >
            // TODO:
            >(/*base_t::radius()*/);
    }

    template <typename Geometry1, typename Geometry2>
    auto comparable_distance(Geometry1 const&, Geometry2 const&,
                             std::enable_if_t
                                <
                                    util::is_segment<Geometry1>::value
                                    && util::is_segment<Geometry2>::value
                                > * = nullptr) const
    {
        //return geometry::strategy::distance::comparable::cross_track
        return geometry::strategy::distance::cross_track
            <
                CalculationType,
                //geometry::strategy::distance::comparable::haversine
                geometry::strategy::distance::haversine
                    <
                        typename base_t::radius_type, CalculationType
                    >
            >(base_t::radius());
    }
};


} // namespace detail
#endif // DOXYGEN_NO_DETAIL


template <typename CalculationType = void>
class spherical
    : public strategies::index::detail::spherical<void, CalculationType>
{};


namespace services
{

template <typename Geometry>
struct default_strategy<Geometry, spherical_tag>
{
    using type = strategies::index::spherical<>;
};

template <typename Geometry>
struct default_strategy<Geometry, spherical_equatorial_tag>
{
    using type = strategies::index::spherical<>;
};

template <typename Geometry>
struct default_strategy<Geometry, spherical_polar_tag>
{
    using type = strategies::index::spherical<>;
};

// TEMP - needed in distance until umbrella strategies are supported
template <typename CalculationType, typename SubStrategy>
struct strategy_converter<strategy::distance::comparable::cross_track<CalculationType, SubStrategy>>
{
    static auto get(strategy::distance::comparable::cross_track<CalculationType, SubStrategy> const& )
    {
        return strategies::index::spherical<CalculationType>();
    }
};
// TEMP - needed in distance until umbrella strategies are supported
template <typename RadiusOrSphere, typename CalculationType>
struct strategy_converter<strategy::distance::comparable::haversine<RadiusOrSphere, CalculationType>>
{
    static auto get(strategy::distance::comparable::haversine<RadiusOrSphere, CalculationType> const&)
    {
        return strategies::index::spherical<CalculationType>();
    }
};

} // namespace services


}}}} // namespace boost::geometry::strategy::index

#endif // BOOST_GEOMETRY_STRATEGIES_INDEX_SPHERICAL_HPP
