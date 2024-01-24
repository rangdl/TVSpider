/*
* @File     : liangzi.js
* @Author   : jade
* @Date     : 2024/1/24 9:15
* @Email    : jadehh@1ive.com
* @Software : Samples
* @Desc     : 量子资源
*/
import {_} from '../lib/cat.js';
import {VodDetail, VodShort} from "../lib/vod.js"
import * as Utils from "../lib/utils.js";
import {Spider} from "./spider.js";

class LiangziSpider extends Spider {
    constructor() {
        super();
        this.siteUrl = "https://cj.lzcaiji.com"
    }

    getAppName() {
        return "量子资源"
    }

    getName() {
        return "🐝|量子资源|🐝"
    }

    async parseVodShortListFromJson(obj) {
        let vod_list = []
        for (const vod_data of obj["list"]) {
            let vodShort = new VodShort();
            vodShort.vod_pic = vod_data["vod_pic"]
            vodShort.vod_id = vod_data["vod_id"]
            vodShort.vod_name = vod_data["vod_name"]
            vodShort.vod_remarks = vod_data["vod_remarks"]
            vod_list.push(vodShort)
        }
        return vod_list
    }

    async parseVodDetailfromJson(obj) {
        let vodDetail = new VodDetail();
        let vod_data_list = obj["list"]
        if (vod_data_list.length > 0){
            let vod_data = vod_data_list[0]
            vodDetail.vod_name = vod_data["vod_name"]
            vodDetail.vod_pic = vod_data["vod_pic"]
            vodDetail.vod_remarks = vod_data["vod_remarks"]
            vodDetail.vod_area = vod_data["vod_area"]
            vodDetail.vod_year = vod_data["vod_year"]
            vodDetail.vod_actor = vod_data["vod_actor"]
            vodDetail.vod_director = vod_data["vod_director"]
            vodDetail.vod_content = vod_data["vod_content"]
            vodDetail.vod_play_from = vod_data["vod_play_from"]
            vodDetail.vod_play_url = vod_data["vod_play_url"]
            vodDetail.type_name = vod_data["type_name"]
        }
        return vodDetail
    }

    async setClasses() {
        let content = await this.fetch(this.siteUrl + "/api.php/provide/vod/from/liangzi/", {"ac": "list"}, this.getHeader())
        let contentJson = JSON.parse(content)
        for (const class_dic of contentJson["class"]) {
            this.classes.push(this.getTypeDic(class_dic["type_name"], class_dic["type_id"]))
        }
    }

    async getFilter(typeElements) {
        let value_list = []
        for (const typeElement of typeElements) {
            value_list.push({
                "n": typeElement.attribs["title"],
                "v":typeElement.attribs["href"].split("/").slice(-1)[0].split(".")[0],
            })
        }
        return [{"key": "1", "name": "类型", "value": value_list}]
    }

    async setFilterObj() {
        let $ = await this.getHtml("http://www.lzzy.tv/")
        let navElements = $("[class=\"dropdown\"]")
        for (const navElement of navElements) {
            let typeElements = $(navElement).find("a")
            let type_id = typeElements[0].attribs["href"].split("/").slice(-1)[0].split(".")[0]
            if (typeElements.length > 1) {
                this.filterObj[type_id] = await this.getFilter(typeElements)
            }
        }
    }

    async setHomeVod() {
        let content = await this.fetch(this.siteUrl + "/api.php/provide/vod", {"ac": "detail"}, this.getHeader());
        this.homeVodList = await this.parseVodShortListFromJson(JSON.parse(content))
    }

    async setDetail(id) {
        let content = await this.fetch(this.siteUrl + "/api.php/provide/vod",{"ac":"detail","ids":id},this.getHeader())
        this.vodDetail = await  this.parseVodDetailfromJson(JSON.parse(content))
    }

    async setPlay(flag, id, flags) {
        if (flag === "liangzi"){
            let $ = await this.getHtml(id)
            this.playUrl =id.split("/")[0] + "//" + id.split("/")[2] + Utils.getStrByRegex(/var main = "(.*?)";/,$.html())
        }else{
            this.playUrl = id
        }

    }
}

let spider = new LiangziSpider()

async function init(cfg) {
    await spider.init(cfg)
}

async function home(filter) {
    return await spider.home(filter)
}

async function homeVod() {
    return await spider.homeVod()
}

async function category(tid, pg, filter, extend) {
    return await spider.category(tid, pg, filter, extend)
}

async function detail(id) {
    return await spider.detail(id)
}

async function play(flag, id, flags) {
    return await spider.play(flag, id, flags)
}

async function search(wd, quick) {
    return await spider.search(wd, quick)
}

export function __jsEvalReturn() {
    return {
        init: init, home: home, homeVod: homeVod, category: category, detail: detail, play: play, search: search,
    };
}