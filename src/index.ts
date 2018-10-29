import axios from 'axios';
import * as Bluebird from 'bluebird';
import * as fs from 'fs';
import * as _ from 'lodash';
import { config } from './config';

const cookie = config.cookie;

const timestamp = Date.now();
const baseUrl = 'https://www.shanbay.com/api/v1/bdc/library';
// 正在学习
const familiarUrl = `${baseUrl}/familiar/?ipp=50&_=${timestamp}`;
// 新的单词
const freshUrl = `${baseUrl}/fresh/?ipp=50&_=${timestamp}`;
// 今日单词
const todayUrl = `${baseUrl}/today/?ipp=50&_=${timestamp}`;
// 掌握单词
const masterUrl = `${baseUrl}/master/?ipp=50&_=${timestamp}`;
// 简单词
const resolvedUrl = `${baseUrl}/resolved/?ipp=50&_=${timestamp}`;
// 易错词
const hardUrl = `${baseUrl}/hard/?ipp=50&_=${timestamp}`;

let bodys: any[] = [];

const main = async () => {
  await Bluebird.each([familiarUrl, freshUrl, todayUrl, masterUrl, resolvedUrl, hardUrl], async url => {
    const res = await axios.get(url, { headers: { cookie }, responseType: 'json' });
    if (res.data.status_code === 0 && res.data.data.total > 0) {
      bodys = bodys.concat(res.data.data.objects);
      const total: number = res.data.data.total;
      const ipp: number = res.data.data.ipp;
      const sumPage = parseInt((total / ipp).toString(), 10) + (total % ipp > 0 ? 1 : 0);
      if (sumPage > 1) {
        for (let index = 2; index < sumPage; index++) {
          const nextRes = await axios.get(`${url}&page=${index}`, { headers: { cookie }, responseType: 'json' });
          bodys = bodys.concat(nextRes.data.data.objects);
        }
      }
    } else {
      console.error('请求错误: ', `url: ${url}; res.data: ${res.data}`);
    }
  });
  bodys = _.orderBy(bodys, ['content']);
  bodys = _.uniqBy(bodys, 'content');
  let md: string = '# 单词集合\n\n|序号|单词|音标|解释|\n|---|---|---|---|\n';
  bodys = await Bluebird.each(bodys, (body, index) => {
    md += `|${index + 1}|${body.content.replace('\n', '<br>')}|/${body.pronunciation.replace(
      '\n',
      '<br>'
    )}/|${body.definition.replace('\n', '<br>')}|\n`;
  });
  fs.writeFileSync('./out/words.md', md);
};

main();
