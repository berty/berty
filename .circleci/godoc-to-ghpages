#!/usr/bin/env bash

source_root=$(pwd)
create_gh_pages_branch=1

while [ -n "$1" ]
do
	case $1	in
	-s) source_root=$2;;
	-g) create_gh_pages_branch=0;;
	esac
	shift
done

echo "source package: ${source_root}"
if [[ ${create_gh_pages_branch} == 0 ]]
then
    echo "create gh-pages branch: true"
else
    echo "create gh-pages branch: false"
fi

cd ${source_root}
branch=$(git branch | grep \* | cut -d ' ' -f2)
echo "current branch: ${branch}"

# Run godocs locally
echo "starting godocs locally at 8080 to fetch static docs"
godoc -http=:8080 &
#target=$(echo ${source_root} | rev | cut -d"/" -f1 | rev)

target=$(echo ${source_root} | sed -e "s/.*src\///g")
path="localhost:8080/pkg/${target}/"
echo "path: ${path}"

while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' ${path})" != "200" ]]; do echo "waiting for godocs to be available"; sleep 10; done

echo "godocs hosted successfully at port 8080"

# Fetch the static godocs in a temporary package
echo "Fetching the static docs in tmp directory"
wget -r -np -N -E -p -k http://${path} -e robots=off -P ./

# Update the links in all the index.html to point to the images and other required things properly
echo "updating relative links in all index.html files"
cd localhost:8080

find . -type f -name 'index.html' | while read line; do
    p=$(dirname $line)
    cp -r doc $p
    cp -r lib $p
    sed -i '' s/"http\:\/\/localhost\:8080\/"/"\.\/"/g $p/index.html
    sed -i '' s/"\.\.\/\.\.\/\.\.\/\.\.\/"/"\.\/"/g $p/index.html
done

echo "relative links updated"

cd ..
mkdir -p ~/tmp_gh_docs
mv localhost:8080 ~/tmp_gh_docs/

echo "un-hosting locally hosted godocs"

id=$(ps -ef | grep "godoc" | grep 8080 | tr -s " " | cut -d" " -f2)
kill $id

if [[ ${create_gh_pages_branch} == 0 ]]
then
    echo "creating orphan branch gh-pages"
    git checkout --orphan gh-pages
else
    echo "checking out gh-pages"
    git checkout gh-pages
fi

if [ $? != 0 ];
then
    echo "error checking out gh-pages branch"
    exit 1
fi

echo "emptying gh-pages"
git rm -rf .

echo "copying the static docs to gh-pages"
cp -r ~/tmp_gh_docs/${path}/* ./

if [ -e ./build ];
then
    rm -r ./build
fi

git add .
git commit -m "static godocs of branch ${branch} created on $(date)"
git push origin gh-pages

echo "static godocs pushed. Start seeing changes"
echo "cleaning temporary dir"
rm -r ~/tmp_gh_docs/

exit 0