git config --global user.name 'ByUsi-link' 
git config --global user.email '14266085+byusi-link@user.noreply.gitee.com'
git add .
git commit -m "$1"
git remote add origin https://gitee.com/byusi/proxy.git
git push -u origin "master"
