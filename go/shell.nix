let
  pkgs = import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/20.09.tar.gz") {};
in
pkgs.mkShell {
    buildInputs = with pkgs; [
        go
    ];
}
