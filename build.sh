jsdoc -c conf.json -t node_modules/fedoc-template
git checkout gh-pages
cp -r doc/scripts ./
cp -r doc/styles ./
cp -r doc/tutorials ./
cp doc/*.html ./
git add --all
git commit -m '문서업데이트'
git push origin gh-pages:gh-pages
