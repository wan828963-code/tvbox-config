# -*- coding: utf-8 -*-
"""
绯夜 · CRIMSON NIGHT —— TVBox Python 源
"""

import sys
import json
import requests

sys.path.append('..')
from base.spider import Spider


class Spider(Spider):

    def getName(self):
        return "绯夜"

    def init(self, extend=""):
        # 已修正双斜杠
        self.apis = [
            "https://yujiaju-1z89.pages.dev/api/",
            "https://yujiaju-1z89.pages.dev/api2/",
            "https://yujiaju-1z89.pages.dev/api3/",
        ]
        self.ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
        self.headers = {
            "User-Agent": self.ua,
            "Accept": "application/json",
        }
        self.line = 0
        self.dead = set()

    def getDependence(self):
        return []

    def isVideoFormat(self, url):
        return False

    def manualVideoCheck(self):
        return False

    def _api(self, params):
        last_err = None
        for i in range(self.line, len(self.apis)):
            if i != self.line and i in self.dead:
                continue
            try:
                r = requests.get(self.apis[i], params=params,
                                 headers=self.headers, timeout=15)
                if r.status_code != 200:
                    raise Exception("HTTP %s" % r.status_code)
                data = r.json()
                if i != self.line:
                    self.line = i
                return data
            except Exception as e:
                last_err = e
                self.dead.add(i)
        raise Exception("所有线路均不可用：%s" % last_err)

    def homeContent(self, filter):
        result = {"class": [], "filters": {}}
        try:
            d = self._api({"ac": "list"})
            cats = d.get("class") or []
            parents = set(str(c.get("type_pid")) for c in cats)
            leaves = [c for c in cats if str(c.get("type_id")) not in parents]
            if not leaves:
                leaves = cats
            result["class"] = [
                {"type_id": str(c.get("type_id")),
                 "type_name": c.get("type_name", "")}
                for c in leaves
            ]
        except Exception:
            pass
        return result

    def homeVideoContent(self):
        try:
            d = self._api({"ac": "videolist", "pg": 1, "pagesize": 30})
            return {"list": self._parse_list(d.get("list") or [])}
        except Exception:
            return {"list": []}

    def categoryContent(self, tid, pg, filter, extend):
        try:
            params = {"ac": "videolist", "pg": pg, "pagesize": 30}
            if tid and not str(tid).startswith("kw:"):
                params["t"] = tid
            d = self._api(params)
            return {
                "list": self._parse_list(d.get("list") or []),
                "page": int(pg),
                "pagecount": int(d.get("pagecount") or 1),
                "limit": 30,
                "total": int(d.get("total") or 0),
            }
        except Exception as e:
            return {"list": [], "msg": str(e)}

    def _parse_list(self, lst):
        out = []
        for v in lst:
            out.append({
                "vod_id": str(v.get("vod_id")),
                "vod_name": v.get("vod_name", ""),
                "vod_pic": v.get("vod_pic", ""),
                "vod_remarks": v.get("vod_remarks", ""),
            })
        return out

    def detailContent(self, did):
        vid = did[0]
        try:
            d = self._api({"ac": "detail", "ids": vid})
            v = (d.get("list") or [None])[0]
            if not v:
                return {"list": []}
            return {
                "list": [{
                    "vod_id": str(v.get("vod_id")),
                    "vod_name": v.get("vod_name", ""),
                    "vod_pic": v.get("vod_pic", ""),
                    "type_name": v.get("type_name", ""),
                    "vod_year": v.get("vod_year", ""),
                    "vod_area": v.get("vod_area", ""),
                    "vod_remarks": v.get("vod_remarks", ""),
                    "vod_actor": v.get("vod_actor", ""),
                    "vod_director": v.get("vod_director", ""),
                    "vod_content": v.get("vod_content", ""),
                    "vod_play_from": v.get("vod_play_from", ""),
                    "vod_play_url": v.get("vod_play_url", ""),
                }]
            }
        except Exception as e:
            return {"list": [], "msg": str(e)}

    def searchContent(self, key, quick, pg="1"):
        try:
            d = self._api({"ac": "videolist", "wd": key, "pg": pg, "pagesize": 30})
            return {"list": self._parse_list(d.get("list") or [])}
        except Exception as e:
            return {"list": [], "msg": str(e)}

    def playerContent(self, flag, pid, vipFlags):
        return {
            "parse": 0,
            "playUrl": "",
            "url": pid,
            "header": json.dumps({"User-Agent": self.ua}),
        }

    def localProxy(self, params):
        return None

    def destroy(self):
        return "done"


if __name__ == "__main__":
    pass