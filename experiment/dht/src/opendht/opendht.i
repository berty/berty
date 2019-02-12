%module opendht

%{
#include "opendht.h"
class Std_String {}
class DhtRunner : public dht::DhtRunner {};
%}

%include "opendht.h"
class DhtRunner : public dht::DhtRunner {
  public:
    void run(in_port_t port, Config config) {
      dht::DhtRunner::run(port, config);
    }
    void bootstrap(const std::string& host, const std::string& service) {
      dht::DhtRunner::bootstrap(host, service);
    }
};

class Std_String {
  public:
    Std_String(char *str) {
      return std::string(str)
    }
};
