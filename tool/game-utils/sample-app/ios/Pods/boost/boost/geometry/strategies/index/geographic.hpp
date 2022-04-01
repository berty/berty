// Boost.Geometry

// Copyright (c) 2020, Oracle and/or its affiliates.

// Contributed and/or modified by Adam Wulkiewicz, on behalf of Oracle

// Licensed under the Boost Software License version 1.0.
// http://www.boost.org/users/license.html

#ifndef BOOST_GEOMETRY_STRATEGIES_INDEX_GEOGRAPHIC_HPP
#define BOOST_GEOMETRY_STRATEGIES_INDEX_GEOGRAPHIC_HPP


#include <boost/geometry/strategies/index/services.hpp>
#include <boost/geometry/strategies/relate/geographic.hpp>

// TEMP - move to strategy
#include <boost/geometry/strategies/geographic/distance.hpp>
#include <boost/geometry/strategies/geographic/distance_andoyer.hpp>
#include <boost/geometry/strategies/geographic/distance_cross_track.hpp>
#include <boost/geometry/strategies/geographic/distance_cross_track_box_box.hpp>
#include <boost/geometry/strategies/geographic/distance_cross_track_point_box.hpp>
#include <boost/geometry/strategies/geographic/distance_segment_box.hpp>
#include <boost/geometry/strategies/geographic/distance_thomas.hpp>
#include <boost/geometry/strategies/geographic/distance_vincenty.hpp>


namespace boost { namespace geometry { namespace strategies { namespace index
{

template
<
    typename FormulaPolicy = strategy::andoyer,
    // TODO: Is SeriesOrder argument needed here?
    std::size_t SeriesOrder = strategy::default_order<FormulaPolicy>::value,
    typename Spheroid = srs::spheroid<double>,
    typename CalculationType = void
>
class geographic
    : public relate::geographic<FormulaPolicy, SeriesOrder, Spheroid, CalculationType>
{
    typedef relate::geographic<FormulaPolicy, SeriesOrder, Spheroid, CalculationType> base_t;

public:
    geographic()
        : base_t()
    {}

    explicit geographic(Spheroid const& spheroid)
        : base_t(spheroid)
    {}

    template <typename Geometry1, typename Geometry2>
    auto comparable_distance(Geometry1 const&, Geometry2 const&,
                             std::enable_if_t
                                <
                                    util::is_pointlike<Geometry1>::value
                                    && util::is_pointlike<Geometry2>::value
                                > * = nullptr) const
    {
        return geometry::strategy::distance::geographic
            <
                FormulaPolicy, Spheroid, CalculationType
            >(base_t::m_spheroid);
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
        return geometry::strategy::distance::geographic_cross_track
            <
                FormulaPolicy, Spheroid, CalculationType
            >(base_t::m_spheroid);
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
        return geometry::strategy::distance::geographic_cross_track_point_box
            <
                FormulaPolicy, Spheroid, CalculationType
            >(base_t::m_spheroid);
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
        return geometry::strategy::distance::geographic_segment_box
            <
                FormulaPolicy, Spheroid, CalculationType
            >(base_t::m_spheroid);
    }

    template <typename Geometry1, typename Geometry2>
    auto comparable_distance(Geometry1 const&, Geometry2 const&,
                             std::enable_if_t
                                <
                                    util::is_segment<Geometry1>::value
                                    && util::is_segment<Geometry2>::value
                                > * = nullptr) const
    {
        return geometry::strategy::distance::geographic_cross_track
            <
                FormulaPolicy, Spheroid, CalculationType
            >(base_t::m_spheroid);
    }
};


namespace services
{

template <typename Geometry>
struct default_strategy<Geometry, geographic_tag>
{
    using type = strategies::index::geographic<>;
};

// TEMP - needed in distance until umbrella strategies are supported
template <typename FormulaPolicy, typename Spheroid, typename CalculationType>
struct strategy_converter<strategy::distance::geographic_cross_track<FormulaPolicy, Spheroid, CalculationType>>
{
    static auto get(strategy::distance::geographic_cross_track<FormulaPolicy, Spheroid, CalculationType> const& strategy)
    {
        return strategies::index::geographic
            <
                FormulaPolicy,
                strategy::default_order<FormulaPolicy>::value,
                Spheroid,
                CalculationType
            >(strategy.model());
    }
};
// TEMP - needed in distance until umbrella strategies are supported
template <typename FormulaPolicy, typename Spheroid, typename CalculationType, bool Bisection, bool EnableClosestPoint>
struct strategy_converter<strategy::distance::detail::geographic_cross_track<FormulaPolicy, Spheroid, CalculationType, Bisection, EnableClosestPoint>>
{
    typedef strategies::index::geographic
        <
            FormulaPolicy,
            strategy::default_order<FormulaPolicy>::value,
            Spheroid,
            CalculationType
        > base_strategy;

    struct altered_strategy : base_strategy
    {
        explicit altered_strategy(Spheroid const& spheroid)
            : base_strategy(spheroid)
        {}

        // It seems that this declaration is needed because comparable_distance
        // is not static function.
        using base_strategy::comparable_distance;

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
            return geometry::strategy::distance::detail::geographic_cross_track
                <
                    FormulaPolicy, Spheroid, CalculationType, Bisection, EnableClosestPoint
                >(base_strategy::m_spheroid);
        }

        template <typename Geometry1, typename Geometry2>
        auto comparable_distance(Geometry1 const&, Geometry2 const&,
                                 std::enable_if_t
                                    <
                                        util::is_segment<Geometry1>::value
                                        && util::is_segment<Geometry2>::value
                                    > * = nullptr) const
        {
            return geometry::strategy::distance::detail::geographic_cross_track
                <
                    FormulaPolicy, Spheroid, CalculationType, Bisection, EnableClosestPoint
                >(base_strategy::m_spheroid);
        }
    };

    static auto get(strategy::distance::detail::geographic_cross_track<FormulaPolicy, Spheroid, CalculationType, Bisection, EnableClosestPoint> const& strategy)
    {
        return altered_strategy(strategy.model());
    }
};
// TEMP - needed in distance until umbrella strategies are supported
template <typename FormulaPolicy, typename Spheroid, typename CalculationType>
struct strategy_converter<strategy::distance::geographic<FormulaPolicy, Spheroid, CalculationType>>
{
    static auto get(strategy::distance::geographic<FormulaPolicy, Spheroid, CalculationType> const& strategy)
    {
        return strategies::index::geographic
            <
                FormulaPolicy,
                strategy::default_order<FormulaPolicy>::value,
                Spheroid,
                CalculationType
            >(strategy.model());
    }
};
// TEMP - needed in distance until umbrella strategies are supported
template <typename Spheroid, typename CalculationType>
struct strategy_converter<strategy::distance::andoyer<Spheroid, CalculationType>>
{
    static auto get(strategy::distance::andoyer<Spheroid, CalculationType> const& strategy)
    {
        return strategies::index::geographic
            <
                strategy::andoyer,
                strategy::default_order<strategy::andoyer>::value,
                Spheroid,
                CalculationType
            >(strategy.model());
    }
};
// TEMP - needed in distance until umbrella strategies are supported
template <typename Spheroid, typename CalculationType>
struct strategy_converter<strategy::distance::thomas<Spheroid, CalculationType>>
{
    static auto get(strategy::distance::thomas<Spheroid, CalculationType> const& strategy)
    {
        return strategies::index::geographic
            <
                strategy::thomas,
                strategy::default_order<strategy::thomas>::value,
                Spheroid,
                CalculationType
            >(strategy.model());
    }
};
// TEMP - needed in distance until umbrella strategies are supported
template <typename Spheroid, typename CalculationType>
struct strategy_converter<strategy::distance::vincenty<Spheroid, CalculationType>>
{
    static auto get(strategy::distance::vincenty<Spheroid, CalculationType> const& strategy)
    {
        return strategies::index::geographic
            <
                strategy::vincenty,
                strategy::default_order<strategy::vincenty>::value,
                Spheroid,
                CalculationType
            >(strategy.model());
    }
};

} // namespace services


}}}} // namespace boost::geometry::strategy::index

#endif // BOOST_GEOMETRY_STRATEGIES_INDEX_GEOGRAPHIC_HPP
