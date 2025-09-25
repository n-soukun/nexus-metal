/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* global $ */

// デフォルトロゴ
const DefaultBlueLogo = "./img/default_order_logo.png";
const DefaultRedLogo = "./img/default_chaos_logo.png";
const DefaultTournamentLogo = "./img/default_tournament_logo.png";

// 力の偉業アイコン
const Icons = {
    blue: {
        firstBlood: [
            "img/feats/Blue_First_Blood_0.png",
            "img/feats/Blue_First_Blood_1.png",
            "img/feats/Blue_First_Blood_2.png",
            "img/feats/Blue_First_Blood_3.png",
        ],
        firstBrick: [
            "img/feats/Blue_Tower_Not_Active.png",
            "img/feats/Blue_Tower_Active.png",
        ],
        killMonster: [
            "img/feats/Blue_PIP_Active_0.png",
            "img/feats/Blue_PIP_Active_1.png",
            "img/feats/Blue_PIP_Active_2.png",
            "img/feats/Blue_PIP_Active_3.png",
        ],
    },
    red: {
        firstBlood: [
            "img/feats/Red_First_Blood_0.png",
            "img/feats/Red_First_Blood_1.png",
            "img/feats/Red_First_Blood_2.png",
            "img/feats/Red_First_Blood_3.png",
        ],
        firstBrick: [
            "img/feats/Red_Tower_Not_Active.png",
            "img/feats/Red_Tower_Active.png",
        ],
        killMonster: [
            "img/feats/Red_PIP_Active_0.png",
            "img/feats/Red_PIP_Active_1.png",
            "img/feats/Red_PIP_Active_2.png",
            "img/feats/Red_PIP_Active_3.png",
        ],
    },
};

const url = new URL(window.location.href);
url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

// WebSocketサーバーのURLを指定
// const webSocketServerURL = `${url.protocol}//${url.host}/ws`;
const webSocketServerURL = "ws://localhost:3002/ws"; // ローカルでテストする場合

const socket = new WebSocket(webSocketServerURL);

// 接続開始
socket.addEventListener("open", (event) => {
    console.log("WebSocket | Open: ", event);
    socket.send(JSON.stringify({ type: "request-current-data" }));
});

// メッセージ受信
socket.addEventListener("message", (event) => {
    console.log("WebSocket | Message ", event.data);
    const receivedData = JSON.parse(event.data);
    if (receivedData.type === "game-stats") {
        updateHUD(receivedData.data);
    } else if (receivedData.type === "game-time") {
        updateGameTime(receivedData.data);
    } else if (receivedData.type === "hud-customize") {
        updateHudCustomize(receivedData.data);
    }
});

// 接続終了
socket.addEventListener("close", (event) => {
    console.log("WebSocket | Closed: ", event);
});

// エラー発生
socket.addEventListener("error", (event) => {
    console.error("WebSocket | Error: ", event);
});

/**
 * HUDのゲームステータス情報を更新する
 * @param {Object} gameStats - ゲームステータス情報
 */
function updateHUD(gameStats) {
    console.log("Updating HUD with game stats: ", gameStats);

    // ブルーチームのスコア更新
    updateTeamScore("blue", gameStats.blueTeam);

    // レッドチームのスコア更新
    updateTeamScore("red", gameStats.redTeam);
}

/**
 * HUDのカスタマイズ情報を更新する
 * @param {Object} customize - カスタマイズ情報
 */
function updateHudCustomize(customize) {
    console.log("Updating HUD customize: ", customize);

    // ブルーチーム
    updateTeamUI("blue", customize, DefaultBlueLogo);

    // レッドチーム
    updateTeamUI("red", customize, DefaultRedLogo);

    // トーナメントロゴ
    $("#tournamentLogo").attr(
        "src",
        customize.tournamentLogo || DefaultTournamentLogo
    );
}

/**
 * チームのスコア情報を更新する
 * @param {string} team - "blue" or "red"
 * @param {Object} score - スコア情報
 */
function updateTeamScore(team, score) {
    const teamPrefix = team === "blue" ? "Order" : "Chaos";

    $(`#${teamPrefix}Kill`).text(score.kills);
    $(`#${teamPrefix}Gold`).text(score.golds);
    $(`#${teamPrefix}Turret`).text(score.turrets);
    $(`#${teamPrefix}Horde`).text(score.killHordes);
    $(`#${teamPrefix}FirstBlood`).attr(
        "src",
        Icons[team].firstBlood[Number(score.featsProgress.firstBloods)]
    );
    $(`#${teamPrefix}FirstBrick`).attr(
        "src",

        Icons[team].firstBrick[Number(score.featsProgress.firstBricks)]
    );
    $(`#${teamPrefix}KillMonster`).attr(
        "src",
        Icons[team].killMonster[score.featsProgress.killMonsters]
    );

    // ドラゴン
    const dragonArea = $(`#${teamPrefix}DragonArea`);
    const dragons = score.dragons; // ドラゴン名の配列
    if (dragons.length > 0) {
        // DragonAreaのhiddenクラスを削除
        dragonArea.removeClass("hidden");
    } else {
        // dragonsが空の場合、OrderDragonAreaにhiddenクラスを追加
        dragonArea.addClass("hidden");
    }
    const html = `
        ${dragons
            .map(
                (dragon) =>
                    `<div class="indicators-icon-area"><img src="img/dragons/${dragon}_Dragon.png" alt="${dragon}" title="${dragon}" /></div>`
            )
            .join("")}
    `;
    dragonArea.html(html);

    // アタカン
    const atakhanArea = $(`#${teamPrefix}AtakhanArea`);
    if (score.killAtakhans > 0) {
        // OrderAtakhanAreaのhiddenクラスを削除
        atakhanArea.removeClass("hidden");
    } else {
        // killAtakhansが0の場合、OrderAtakhanAreaにhiddenクラスを追加
        atakhanArea.addClass("hidden");
    }
}

/**
 * チームのUIを更新する
 * @param {string} team - "blue" or "red"
 * @param {Object} data - カスタマイズデータ
 * @param {string} defaultLogo - デフォルトのロゴ画像パス
 */
function updateTeamUI(team, customize, defaultLogo) {
    const teamPrefix = team === "blue" ? "Order" : "Chaos";

    // チーム名
    $(`#${teamPrefix}TeamName`).text(
        customize[`${team}Name`] || teamPrefix.toUpperCase()
    );

    // サブタイトル
    if (customize[`${team}Subtitle`]) {
        $(`#${teamPrefix}TeamSubName`).removeClass("hidden");
        $(`#${teamPrefix}TeamSubName`).text(customize[`${team}Subtitle`]);
    } else {
        $(`#${teamPrefix}TeamSubName`).addClass("hidden");
    }

    // 勝利数インジケーター
    const winScoreDots = $(`#${teamPrefix}WinScore .score-dot`);

    if (customize.tournamentRule === "bo3") {
        // bo3の場合は2つだけ表示
        winScoreDots.eq(2).addClass("hidden");
    } else {
        winScoreDots.eq(2).removeClass("hidden");
    }

    const wins = customize[`${team}Wins`] || 0;
    winScoreDots.each((index, element) => {
        if (index < wins) {
            $(element).addClass("active");
        } else {
            $(element).removeClass("active");
        }
    });

    // チームロゴ
    $(`#${teamPrefix}TeamLogo`).attr(
        "src",
        customize[`${team}Logo`] || defaultLogo
    );
}

/**
 * ゲーム時間を更新する
 * @param {Object} time - ゲーム時間情報
 */
function updateGameTime(time) {
    const gameSeconds = time.seconds;
    // ゲーム時間の更新
    const minutes = Math.floor(gameSeconds / 60);
    const seconds = Math.floor(gameSeconds % 60);
    const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    $("#GameTime").text(formattedTime);
}
