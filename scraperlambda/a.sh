#!/bin/bash

yum install ncurses-devel openssl-devel -y
yum groupinstall "Development Tools" -y

cd /tmp
wget "http://erlang.org/download/otp_src_19.3.tar.gz" -O otp19.tar.gz
tar xfz otp19.tar.gz
cd otp_src_19.3/
./configure
make && make install

cd /tmp
wget "https://github.com/elixir-lang/elixir/archive/v1.4.4.tar.gz"
tar xfz v1.4.4.tar.gz
cd elixir-1.4.4/
export PATH="${PATH}:/usr/local/bin"
make && make install
