bless 项目注册脚本。 

1. 在 data 文件夹下配置邮箱和代理ip地址， 需要1V1对应。
2. src/email_operator.js 封装 通过邮箱地址获取验证码的函数。
3. config.js 更改 chrome 浏览器地址和文件存储目录
4. 执行 index.js ,开发版本，不可以直接使用 
5. 账号信息会写入 data/account.csv 文件