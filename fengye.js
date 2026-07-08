# -*- coding: utf-8 -*-
import re, urllib.parse
import json
from bs4 import BeautifulSoup
import requests
from base.spider import Spider as BaseSpider


class Spider(BaseSpider):
    def init(self, extend=""):
        self.host = "https://maihaolian.com"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9",
        }

    def getName(self):
        return '枫叶影院'

    def _fetch(self, url):
        if not url.startswith('http'):
            url = self.host + url
        try:
            resp = requests.get(url, headers=self.headers, timeout=15)
            resp.encoding = 'utf-8'
            return resp.text
        except Exception as e:
            print("请求失败:", e)
            return ""

    def _parse_video_list(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        items = []
        for item in soup.select('.public-list-div.public-list-bj, .module-item'):
            a = item.select_one('a.public-list-exp, a')
            if not a:
                continue
            vod_id = a.get('href', '')
            vod_name = a.get('title', '').strip() or a.get_text(strip=True)
            img = item.select_one('img')
            vod_pic = img.get('data-src') or img.get('src', '') if img else ''
            remarks = item.select_one('.public-prt-g, .module-item-note, .ft2')
            vod_remarks = remarks.get_text(strip=True) if remarks else ''
            if vod_id and vod_name:
                items.append({
                    "vod_id": vod_id,
                    "vod_name": vod_name,
                    "vod_pic": vod_pic,
                    "vod_remarks": vod_remarks
                })
        return items

    def homeContent(self, filter):
        return {"class": [
            {'type_id': "/label/qq", 'type_name': "腾讯VIP精选"},
            {'type_id': "/label/bli", 'type_name': "B站VIP精选"},
            {'type_id': "/label/youku", 'type_name': "优酷VIP精选"},
            {"type_id": "5", "type_name": "红果短剧"},
            {"type_id": "2", "type_name": "电视剧"},
            {"type_id": "1", "type_name": "电影"},
            {"type_id": "4", "type_name": "动漫"},
            {"type_id": "3", "type_name": "综艺"},
        ], "filters": self._build_filters()}

    def _build_filters(self):
        # （你的原过滤器代码保持不变）
        area = [{"n": "全部", "v": ""}, {"n": "大陆", "v": "大陆"}, {"n": "香港", "v": "香港"}, {"n": "台湾", "v": "台湾"}, {"n": "美国", "v": "美国"}, {"n": "韩国", "v": "韩国"}, {"n": "日本", "v": "日本"}, {"n": "泰国", "v": "泰国"}, {"n": "新加坡", "v": "新加坡"}, {"n": "马来西亚", "v": "马来西亚"}, {"n": "印度", "v": "印度"}, {"n": "英国", "v": "英国"}, {"n": "法国", "v": "法国"}, {"n": "加拿大", "v": "加拿大"}, {"n": "西班牙", "v": "西班牙"}, {"n": "俄罗斯", "v": "俄罗斯"}, {"n": "其它", "v": "其它"}]
        year = [{"n": "全部", "v": ""}] + [{"n": str(y), "v": str(y)} for y in range(2026, 2003, -1)]
        lang = [{"n": "全部", "v": ""}, {"n": "国语", "v": "国语"}, {"n": "英语", "v": "英语"}, {"n": "粤语", "v": "粤语"}, {"n": "闽南语", "v": "闽南语"}, {"n": "韩语", "v": "韩语"}, {"n": "日语", "v": "日语"}, {"n": "法语", "v": "法语"}, {"n": "德语", "v": "德语"}, {"n": "其它", "v": "其它"}]
        sort = [{"n": "时间", "v": "time"}, {"n": "人气", "v": "hits"}, {"n": "评分", "v": "score"}]
        letter = [{"n": "全部", "v": ""}] + [{"n": c, "v": c} for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ"] + [{"n": "0-9", "v": "0-9"}]

        return {
            "2": [{"key": "class", "name": "类型", "value": [{"n": "全部", "v": "2"}, {"n": "国产剧", "v": "13"}, {"n": "日韩剧", "v": "15"}, {"n": "海外剧", "v": "16"}]}] + [{"key": k, "name": n, "value": v} for k,n,v in [("area","地区",area),("genre","剧情",[{"n":"全部","v":""}]),("year","年份",year),("lang","语言",lang),("letter","字母",letter),("sort","排序",sort)]],
            "1": [{"key": "class", "name": "类型", "value": [{"n": "全部", "v": "1"}, {"n": "动作片", "v": "6"}, {"n": "喜剧片", "v": "7"}, {"n": "恐怖片", "v": "8"}, {"n": "科幻片", "v": "9"}, {"n": "爱情片", "v": "10"}, {"n": "剧情片", "v": "11"}]}] + [{"key": k, "name": n, "value": v} for k,n,v in [("area","地区",area),("genre","剧情",[{"n":"全部","v":""}]),("year","年份",year),("lang","语言",lang),("letter","字母",letter),("sort","排序",sort)]],
            # 其他分类可类似添加，这里简化
        }

    def homeVideoContent(self):
        html = self._fetch('/')
        return {"list": self._parse_video_list(html)}

    def categoryContent(self, tid, pg, filter, extend):
        pg = int(pg) or 1
        if tid.startswith('/label'):
            url = f'{tid}/page/{pg}.html'
        else:
            # 基础构造，可根据 extend 进一步完善
            url = f'/cupfox-list/{tid}----{pg}---.html'

        html = self._fetch(url)
        items = self._parse_video_list(html)
        page_count = pg + 2 if len(items) >= 20 else pg + 1

        return {
            "list": items,
            "page": pg,
            "pagecount": page_count,
            "limit": 24
        }

    def searchContent(self, key, quick):
        url = f"/cupfox-search/-------------.html?wd={urllib.parse.quote(key)}"
        html = self._fetch(url)
        return {"list": self._parse_video_list(html)}

    def detailContent(self, ids):
        url = ids[0] if isinstance(ids, list) else ids
        html = self._fetch(url)
        # 简单实现，实际可进一步解析播放列表
        return {
            "list": [{
                "vod_id": url,
                "vod_name": "加载详情...",
                "vod_play_from": "枫叶",
                "vod_play_url": url
            }]
        }

    def playerContent(self, flag, id, vipFlags):
        return {
            "parse": 0,
            "url": self.host + id if not id.startswith('http') else id,
            "header": self.headers
        }