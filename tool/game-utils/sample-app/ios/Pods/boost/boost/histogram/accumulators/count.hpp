// Copyright 2019 Hans Dembinski
//
// Distributed under the Boost Software License, version 1.0.
// (See accompanying file LICENSE_1_0.txt
// or copy at http://www.boost.org/LICENSE_1_0.txt)

#ifndef BOOST_HISTOGRAM_ACCUMULATORS_NUMBER_HPP
#define BOOST_HISTOGRAM_ACCUMULATORS_NUMBER_HPP

#include <boost/core/nvp.hpp>
#include <boost/histogram/fwd.hpp> // for count<>
#include <type_traits>             // for std::common_type

namespace boost {
namespace histogram {
namespace accumulators {

/**
  Uses a C++ builtin arithmetic type to accumulate a count.

  This wrapper class may be used as a base class by users who want to add custom metadata
  to each bin of a histogram. Otherwise, arithmetic types should be used directly as
  accumulators in storages for simplicity. In other words, prefer `dense_storage<double>`
  over `dense_storage<count<double>>`, both are functionally equivalent.

  When weighted data is accumulated and high precision is required, use
  `accumulators::sum` instead. If a local variance estimate for the weight distribution
  should be computed as well (generally needed for a detailed statistical analysis), use
  `accumulators::weighted_sum`.
*/
template <class ValueType>
class count {
public:
  using value_type = ValueType;
  using const_reference = const value_type&;

  count() = default;

  /// Initialize count to value and allow implicit conversion
  count(const_reference value) noexcept : value_(value) {}

  /// Allow implicit conversion from other count
  template <class T>
  count(const count<T>& c) noexcept : count(c.value()) {}

  /// Increment count by one
  count& operator++() noexcept {
    ++value_;
    return *this;
  }

  /// Increment count by value
  count& operator+=(const_reference value) noexcept {
    value_ += value;
    return *this;
  }

  /// Add another count
  count& operator+=(const count& s) noexcept {
    value_ += s.value_;
    return *this;
  }

  /// Scale by value
  count& operator*=(const_reference value) noexcept {
    value_ *= value;
    return *this;
  }

  bool operator==(const count& rhs) const noexcept { return value_ == rhs.value_; }

  bool operator!=(const count& rhs) const noexcept { return !operator==(rhs); }

  /// Return count
  const_reference value() const noexcept { return value_; }

  // conversion to value_type must be explicit
  explicit operator value_type() const noexcept { return value_; }

  template <class Archive>
  void serialize(Archive& ar, unsigned /* version */) {
    ar& make_nvp("value", value_);
  }

  // begin: extra operators to make count behave like a regular number

  count& operator*=(const count& rhs) noexcept {
    value_ *= rhs.value_;
    return *this;
  }

  count operator*(const count& rhs) const noexcept {
    count x = *this;
    x *= rhs;
    return x;
  }

  count& operator/=(const count& rhs) noexcept {
    value_ /= rhs.value_;
    return *this;
  }

  count operator/(const count& rhs) const noexcept {
    count x = *this;
    x /= rhs;
    return x;
  }

  bool operator<(const count& rhs) const noexcept { return value_ < rhs.value_; }

  bool operator>(const count& rhs) const noexcept { return value_ > rhs.value_; }

  bool operator<=(const count& rhs) const noexcept { return value_ <= rhs.value_; }

  bool operator>=(const count& rhs) const noexcept { return value_ >= rhs.value_; }

  // end: extra operators

private:
  value_type value_{};
};

} // namespace accumulators
} // namespace histogram
} // namespace boost

#ifndef BOOST_HISTOGRAM_DOXYGEN_INVOKED
namespace std {
template <class T, class U>
struct common_type<boost::histogram::accumulators::count<T>,
                   boost::histogram::accumulators::count<U>> {
  using type = boost::histogram::accumulators::count<common_type_t<T, U>>;
};
} // namespace std
#endif

#endif
