# -*- coding: utf-8 -*-
import re
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
            resp = requests.get(url, headers=self.headers, timeout=10)
            resp.encoding = 'utf-8'
            return resp.text
        except:
            return ""

    def _parse_video_list(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        items = []
        for item in soup.select('.public-list-div.public-list-bj'):
            a = item.select_one('a.public-list-exp')
            if not a:
                continue
            vod_id = a.get('href', '')
            vod_name = a.get('title', '').strip()
            img = item.select_one('img')
            vod_pic = img.get('data-src') or img.get('src', '') if img else ''
            remarks = item.select_one('.public-prt-g')
            upto = item.select_one('.ft2')
            vod_remarks = f"{remarks.get_text(strip=True) if remarks else ''} {upto.get_text(strip=True) if upto else ''}".strip()
            if vod_id and vod_name:
                items.append({
                    "vod_id": vod_id,
                    "vod_name": vod_name,
                    "vod_pic": vod_pic,
                    "vod_remarks": vod_remarks
                })
        return items

    def homeContent(self, filter):
        return {
            "class": [
                {'type_id': "/label/qq", 'type_name': "腾讯VIP精选"},
                {'type_id': "/label/bli", 'type_name': "B站VIP精选"},
                {'type_id': "/label/youku", 'type_name': "优酷VIP精选"},
                {"type_id": "5", "type_name": "红果短剧"},
                {"type_id": "2", "type_name": "电视剧"},
                {"type_id": "1", "type_name": "电影"},
                {"type_id": "4", "type_name": "动漫"},
                {"type_id": "3", "type_name": "综艺"},
            ],
            "filters": self._build_filters()
        }

    def _build_filters(self):
        area = [{"n": "全部", "v": ""}, {"n": "大陆", "v": "大陆"}, {"n": "香港", "v": "香港"},
                {"n": "台湾", "v": "台湾"}, {"n": "美国", "v": "美国"}, {"n": "韩国", "v": "韩国"},
                {"n": "日本", "v": "日本"}, {"n": "泰国", "v": "泰国"}, {"n": "新加坡", "v": "新加坡"},
                {"n": "马来西亚", "v": "马来西亚"}, {"n": "印度", "v": "印度"}, {"n": "英国", "v": "英国"},
                {"n": "法国", "v": "法国"}, {"n": "加拿大", "v": "加拿大"}, {"n": "西班牙", "v": "西班牙"},
                {"n": "俄罗斯", "v": "俄罗斯"}, {"n": "其它", "v": "其它"}]

        year = [{"n": "全部", "v": ""}] + [{"n": str(y), "v": str(y)} for y in range(2026, 2003, -1)]

        lang = [{"n": "全部", "v": ""}, {"n": "国语", "v": "国语"}, {"n": "英语", "v": "英语"},
                {"n": "粤语", "v": "粤语"}, {"n": "闽南语", "v": "闽南语"}, {"n": "韩语", "v": "韩语"},
                {"n": "日语", "v": "日语"}, {"n": "法语", "v": "法语"}, {"n": "德语", "v": "德语"},
                {"n": "其它", "v": "其它"}]

        sort = [{"n": "时间", "v": "time"}, {"n": "人气", "v": "hits"}, {"n": "评分", "v": "score"}]

        return {
            "2": self._build_type_filters("2", area, year, lang, sort),
            "1": self._build_type_filters("1", area, year, lang, sort),
            "4": self._build_type_filters("4", area, year, lang, sort),
            "3": self._build_type_filters("3", area, year, lang, sort),
            "5": [
                {"key": "year", "name": "年份", "value": year},
                {"key": "letter", "name": "字母", "value": self._letter_filter()},
            ]
        }

    def _letter_filter(self):
        return [{"n": "全部", "v": ""}] + [{"n": c, "v": c} for c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ"] + [{"n": "0-9", "v": "0-9"}]

    def _build_type_filters(self, tid, area, year, lang, sort):
        if tid == "2":
            return [
                {"key": "class", "name": "类型", "value": [{"n": "全部", "v": "2"}, {"n": "国产剧", "v": "13"}, {"n": "日韩剧", "v": "15"}, {"n": "海外剧", "v": "16"}]},
                {"key": "area", "name": "地区", "value": area},
                {"key": "genre", "name": "剧情", "value": [{"n": v[0], "v": v[1]} for v in [("全部", ""), ("古装", "古装"), ("战争", "战争"), ("青春偶像", "青春偶像"), ("喜剧", "喜剧"), ("家庭", "家庭"), ("犯罪", "犯罪"), ("动作", "动作"), ("奇幻", "奇幻"), ("剧情", "剧情"), ("历史", "历史"), ("经典", "经典"), ("乡村", "乡村"), ("情景", "情景"), ("商战", "商战"), ("网剧", "网剧"), ("其他", "其他")]]},
                {"key": "year", "name": "年份", "value": year},
                {"key": "lang", "name": "语言", "value": lang},
                {"key": "letter", "name": "字母", "value": self._letter_filter()},
                {"key": "sort", "name": "排序", "value": sort},
            ]
        # 类似地为其他类型添加（已简化，实际可根据需要扩展）
        return [
            {"key": "class", "name": "类型", "value": [{"n": "全部", "v": tid}]},
            {"key": "area", "name": "地区", "value": area},
            {"key": "year", "name": "年份", "value": year},
            {"key": "lang", "name": "语言", "value": lang},
            {"key": "letter", "name": "字母", "value": self._letter_filter()},
            {"key": "sort", "name": "排序", "value": sort},
        ]

    def homeVideoContent(self):
        html = self._fetch('/')
        return {"list": self._parse_video_list(html)}

    def categoryContent(self, tid, pg, filter, extend):
        pg = int(pg) if pg else 1
        if tid.startswith('/label'):
            url = f"{tid}/page/{pg}.html"
        else:
            # 构造筛选URL（根据站点规则调整）
            params = {
                'class': extend.get('class', tid),
                'area': extend.get('area', ''),
                'year': extend.get('year', ''),
                'lang': extend.get('lang', ''),
                'letter': extend.get('letter', ''),
                'sort': extend.get('sort', 'time')
            }
            url = f"/cupfox-list/{params['class']}-{params['area']}-0-{extend.get('genre','')}-{params['lang']}-{params['letter']}-{params['sort']}-0-{pg}-0-0-{params['year']}.html"

        html = self._fetch(url)
        items = self._parse_video_list(html)

        # 简单翻页逻辑
        page_count = pg + 1 if len(items) >= 20 else pg

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
        # TODO: 根据实际站点详情页结构实现
        # 此处为占位，建议根据需要补充解析逻辑
        url = ids[0] if isinstance(ids, list) else ids
        html = self._fetch(url)
        soup = BeautifulSoup(html, 'html.parser')
        
        title = soup.select_one('.slide-info-title')
        vod_name = title.get_text(strip=True) if title else ''
        
        # 其他字段可继续补充...
        return {
            "list": [{
                "vod_id": url,
                "vod_name": vod_name,
                "vod_pic": "",
                "vod_remarks": "",
                "vod_content": "",
                "vod_play_from": "枫叶",
                "vod_play_url": ""  # 需要进一步解析播放链接
            }]
        }

    def playerContent(self, flag, id, vipFlags):
        # 播放链接解析
        return {
            "parse": 0,
            "url": self.host + id if not id.startswith('http') else id,
            "header": self.headers
        }