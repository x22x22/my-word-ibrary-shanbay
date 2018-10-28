## 项目说明

本项目用于批量非分页生成扇贝词典上的"我的词库"内容到markdown中.

## 使用方法

1. 安装node
1. 将`./src/config_example.ts`拷贝为`./src/config.ts`
1. 将`./src/config.ts`中的cookie内容填写成扇贝网浏览器里的cookie内容
1. 运行`npm i`
1. 运行`npm start`
1. 运行成功后会将内容保存到`./out/words.md`下.