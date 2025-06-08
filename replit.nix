{pkgs}: {
  deps = [
    pkgs.static-web-server
    pkgs.git-filter-repo
    pkgs.unzip
    pkgs.pm2
    pkgs.libuuid
  ];
}
