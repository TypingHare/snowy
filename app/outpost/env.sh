_path="$PWD/bin"
if [[ ":$PATH:" != *":$_path:"* ]]; then
    export PATH="${PATH:+$PATH:}$_path"
fi
