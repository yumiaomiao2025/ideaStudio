import type { Novel } from "./types.js";

// 首次启动写入的示例小说，让 demo 一打开就有内容。
export function seedNovel(): Novel {
  return {
    id: "n1",
    title: "剑入星海",
    genre: "玄幻武侠",
    styleNotes: [
      "句子偏短，平均 14 字；少用长复句",
      "比喻克制，偏冷意象（雪、铁、灯、冻）",
      "对话不写“道”“说”，少用“突然”“忽然”",
      "沈砚（主角）：寡言，说“嗯”代替“是”，不主动开口",
    ],
    volumes: [
      { id: "vol1", title: "卷一 · 少年入江湖", order: 1 },
      { id: "vol2", title: "卷二 · 雪夜入城", order: 2 },
      { id: "vol3", title: "卷三 · 北望", order: 3 },
    ],
    chapters: [
      {
        id: "c41",
        volumeId: "vol2",
        num: 41,
        title: "城门密谈",
        status: "done",
        updatedAt: Date.now(),
        body: [
          "卷一第三十八章后，沈砚自北疆边境一路南下，雪未落足，已先至。",
          "他到的不是城。是城外三里的一座木桥。桥下河水未冻，桥上有一个老者。",
          "老者把断剑横在膝头，看他走近，看了很久，才说：「你父亲的剑，是这一截。」",
        ].join("\n"),
      },
      {
        id: "c42",
        volumeId: "vol2",
        num: 42,
        title: "雪夜城下",
        status: "writing",
        updatedAt: Date.now(),
        body: [
          "雪线压着城墙，像一道压了三天三夜的眉。沈砚把斗篷往下扯，露出半张冻青的脸——城门口的灯笼在风里晃，像是要熄，又像是有人正在里头喘气。",
          "“外乡人？” 守门兵的矛尖斜下来，带着雪。",
          "沈砚没答话。他从怀里摸出半枚铜牌，铜牌缺角的地方还沾着旧血。",
          "守门兵的脸色一下变了。",
        ].join("\n"),
      },
      {
        id: "c43",
        volumeId: "vol2",
        num: 43,
        title: "城主之女",
        status: "draft",
        updatedAt: Date.now(),
        body: "雪夜城里第二盏灯亮起的时候，季元的女儿正在数她父亲今夜还会等到几个客人。",
      },
    ],
    terms: [
      {
        id: "t1",
        name: "半枚铜牌",
        kind: "物品 · 伏笔",
        body: "北疆军中信物，缺角者为叛逃之证。沈砚从父亲尸身上取下；另半枚在反派季元手中。",
        meta: "首次：第 17 章 · 计划回收：第 60 章前后",
        isForeshadow: true,
      },
      {
        id: "t2",
        name: "沈砚",
        kind: "人物 · 主角",
        body: "17 岁。瘦高，冻青脸，右手有冻疮。寡言、冷峻、重诺；对刀剑的反应快于对人。",
        meta: "出场 41 章",
      },
      {
        id: "t3",
        name: "季元",
        kind: "人物 · 反派",
        body: "雪夜城主，世袭。持完整另半枚铜牌。沈砚之父之死与他有关。",
        meta: "首次 第 38 章",
      },
    ],
  };
}
