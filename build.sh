clear
echo "请确保所有该修改的都修改了！！"
echo "6 秒继续"
sleep 6
apt install maven wget golang
mvn clean package
cd proxy-client-golang
go mod tidy
bash build.sh
echo "不出意外的话现在已经完成了所有的编译步骤！"