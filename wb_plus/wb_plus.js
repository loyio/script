/*
README：https://github.com/loyio/SurgeModule
 */

const path1 = "/groups/timeline";
const path2 = "/statuses/unread";
const path3 = "/statuses/extend";
const path4 = "/comments/build_comments";
const path5 = "/photo/recommend_list";
const path6 = "/stories/video_stream";
const path7 = "/statuses/positives/get";
const path8 = "/stories/home_list";
const path9 = "/profile/statuses";
const path10 = "/statuses/friends/timeline";
const path11 = "/service/picfeed";
const path12 = "/fangle/timeline";
const path13 = "/searchall";
const path14 = "/cardlist";
const path15 = "/statuses/video_timeline";
const path16 = "/page";
const path17 = "/statuses/friends_timeline";
const path18 = "/!/photos/pic_recommend_status";
const path19 = "/statuses/video_mixtimeline";
const path20 = "/video/tiny_stream_video_list";
const path21 = "/photo/info";
const path22 = "/live/media_homelist";

const loyio = init()

const weiboplus_str = loyio.getdata("WeiboPlus")
if(!isEmpty(weiboplus_str)){
    weiboplus_list = JSON.parse(weiboplus_str)
    if(weiboplus_str.hasOwnProperty("wp_keyword")){
        var block_str = weiboplus_list["wp_keyword"]
    }else{
        var block_str = null
    }
}else{
    var block_str = null
}
console.log("block_str: "+block_str)

if(isEmpty(block_str)){
    var block_list = [];
}else{
    var block_list = block_str.split(",");
}

loyio.msg("Weibo-plus", "block_str", block_str)

console.log("block_list:",block_list)

loyio.msg("Weibo-plus", "block_list", str(block_list))


function isEmpty(obj){
    if(typeof obj == "undefined" || obj == null || obj == ""){
        return true;
    }else{
        return false;
    }
}


const url = $request.url;
let body = $response.body;

if (
    url.indexOf(path1) != -1 ||
    url.indexOf(path2) != -1 ||
    url.indexOf(path10) != -1 ||
    url.indexOf(path15) != -1 ||
    url.indexOf(path17) != -1 ||
    url.indexOf(path20) != -1
) {
    let obj = JSON.parse(body);
    if (obj.statuses) obj.statuses = filter_timeline_statuses(obj.statuses);
    if (obj.advertises) obj.advertises = [];
    if (obj.ad) obj.ad = [];
    if (obj.num) obj.num = obj.original_num;
    if (obj.trends) obj.trends = [];
    body = JSON.stringify(obj);
} else if (url.indexOf(path3) != -1) {
    let obj = JSON.parse(body);
    if (obj.trend) delete obj.trend;
    body = JSON.stringify(obj);
} else if (url.indexOf(path4) != -1) {
    let obj = JSON.parse(body);
    obj.recommend_max_id = 0;
    if (obj.status) {
        if (obj.top_hot_structs) {
            obj.max_id = obj.top_hot_structs.call_back_struct.max_id;
            delete obj.top_hot_structs;
        }
        if (obj.datas) obj.datas = filter_comments(obj.datas);
    } else {
        obj.datas = [];
    }
    body = JSON.stringify(obj);
} else if (url.indexOf(path5) != -1 || url.indexOf(path18) != -1) {
    let obj = JSON.parse(body);
    obj.data = {};
    body = JSON.stringify(obj);
} else if (url.indexOf(path6) != -1) {
    let obj = JSON.parse(body);
    let segments = obj.segments;
    if (segments && segments.length > 0) {
        let i = segments.length;
        while (i--) {
            const element = segments[i];
            let is_ad = element.is_ad;
            if (is_ad && is_ad == true) segments.splice(i, 1);
        }
    }
    body = JSON.stringify(obj);
} else if (url.indexOf(path7) != -1) {
    let obj = JSON.parse(body);
    obj.datas = [];
    body = JSON.stringify(obj);
} else if (url.indexOf(path8) != -1) {
    let obj = JSON.parse(body);
    obj.story_list = [];
    body = JSON.stringify(obj);
} else if (url.indexOf(path11) != -1 || url.indexOf(path22) != -1) {
    let obj = JSON.parse(body);
    obj.data = [];
    body = JSON.stringify(obj);
} else if (
    url.indexOf(path9) != -1 ||
    url.indexOf(path12) != -1 ||
    url.indexOf(path13) != -1 ||
    url.indexOf(path14) != -1 ||
    url.indexOf(path16) != -1
) {
    let obj = JSON.parse(body);
    if (obj.cards) obj.cards = filter_timeline_cards(obj.cards);
    body = JSON.stringify(obj);
} else if (url.indexOf(path19) != -1) {
    let obj = JSON.parse(body);
    delete obj.expandable_view;
    if (obj.hasOwnProperty("expandable_views")) delete obj.expandable_views;
    body = JSON.stringify(obj);
} else if (url.indexOf(path21) != -1) {
    if (body.indexOf("ad_params") != -1) {
        body = JSON.stringify({});
    }
}

$done({ body });

function filter_timeline_statuses(statuses) {
    if (statuses && statuses.length > 0) {
        let i = statuses.length;
        while (i--) {
            let element = statuses[i];
            if (
                is_timeline_likerecommend(element.title) ||
                is_timeline_ad(element) ||
                is_stream_video_ad(element)
            ) {
                statuses.splice(i, 1);
            }
        }
    }
    return statuses;
}

function filter_comments(datas) {
    if (datas && datas.length > 0) {
        let i = datas.length;
        while (i--) {
            const element = datas[i];
            const type = element.type;
            if (type == 5 || type == 1 || type == 6) datas.splice(i, 1);
        }
    }
    return datas;
}

function filter_timeline_cards(cards) {
    if (cards && cards.length > 0) {
        let j = cards.length;
        while (j--) {
            let item = cards[j];
            let card_group = item.card_group;
            if (card_group && card_group.length > 0) {
                if (item.itemid && item.itemid == "hotword") {
                    filter_top_search(card_group);
                } else {
                    let i = card_group.length;
                    while (i--) {
                        let card_group_item = card_group[i];
                        let card_type = card_group_item.card_type;
                        if (card_type) {
                            if (card_type == 9) {
                                if (is_timeline_ad(card_group_item.mblog))
                                    card_group.splice(i, 1);
                            } else if (card_type == 118 || card_type == 89) {
                                card_group.splice(i, 1);
                            } else if (card_type == 42) {
                                if (
                                    card_group_item.desc ==
                                    "\u53ef\u80fd\u611f\u5174\u8da3\u7684\u4eba"
                                ) {
                                    cards.splice(j, 1);
                                    break;
                                }
                            } else if (card_type == 17) {
                                filter_top_search(card_group_item.group);
                            }
                        }
                    }
                }
            } else {
                let card_type = item.card_type;
                if (card_type && card_type == 9) {
                    if (is_timeline_ad(item.mblog)) cards.splice(j, 1);
                }
            }
        }
    }
    return cards;
}

function filter_top_search(group) {
    if (group && group.length > 0) {
        let k = group.length;
        while (k--) {
            let group_item = group[k];
            if (group_item.hasOwnProperty("promotion")) {
                group.splice(k, 1);
            }else{
              if(group_item.hasOwnProperty("desc")){
                for (let bli = 0; bli < block_list.length; bli++) {
                  if (group_item.desc.indexOf(block_list[bli]) != -1){
                    group.splice(k, 1);
                  }
                }
              } else if(group_item.hasOwnProperty("title_sub")){
                for (let bli = 0; bli < block_list.length; bli++) {
                    if (group_item.title_sub.indexOf(block_list[bli]) != -1){
                      group.splice(k, 1);
                    }
                  }
              }
            }
        }
    }
}

function is_timeline_ad(mblog) {
    if (!mblog) return false;
    let promotiontype =
        mblog.promotion && mblog.promotion.type && mblog.promotion.type == "ad";
    let mblogtype = mblog.mblogtype && mblog.mblogtype == 1;
    return promotiontype || mblogtype ? true : false;
}

function is_timeline_likerecommend(title) {
    return title && title.type && title.type == "likerecommend" ? true : false;
}

function is_stream_video_ad(item) {
    return item.ad_state && item.ad_state == 1;
}

function init() {
    isSurge = () => {
      return undefined === this.$httpClient ? false : true
    }
    isQuanX = () => {
      return undefined === this.$task ? false : true
    }
    getdata = (key) => {
      if (isSurge()) return $persistentStore.read(key)
      if (isQuanX()) return $prefs.valueForKey(key)
    }
    setdata = (key, val) => {
      if (isSurge()) return $persistentStore.write(key, val)
      if (isQuanX()) return $prefs.setValueForKey(key, val)
    }
    msg = (title, subtitle, body) => {
      if (isSurge()) $notification.post(title, subtitle, body)
      if (isQuanX()) $notify(title, subtitle, body)
    }
    log = (message) => console.log(message)
    get = (url, cb) => {
      if (isSurge()) {
        $httpClient.get(url, cb)
      }
      if (isQuanX()) {
        url.method = 'GET'
        $task.fetch(url).then((resp) => cb(null, resp, resp.body))
      }
    }
    post = (url, cb) => {
      if (isSurge()) {
        $httpClient.post(url, cb)
      }
      if (isQuanX()) {
        url.method = 'POST'
        $task.fetch(url).then((resp) => cb(null, resp, resp.body))
      }
    }
    done = (value = {}) => {
      $done(value)
    }
    return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done }
  }