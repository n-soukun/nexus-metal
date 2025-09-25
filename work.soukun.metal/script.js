/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* global $ */

const BlueFirstBloodIcons = [
    "Blue_First_Blood_0.png",
    "Blue_First_Blood_1.png",
    "Blue_First_Blood_2.png",
    "Blue_First_Blood_3.png",
];

const BlueFirstBrickIcons = [
    "Blue_Tower_Not_Active.png",
    "Blue_Tower_Active.png",
];

const BlueKillMonsterIcons = [
    "Blue_PIP_Active_0.png",
    "Blue_PIP_Active_1.png",
    "Blue_PIP_Active_2.png",
    "Blue_PIP_Active_3.png",
];

const RedFirstBloodIcons = [
    "Red_First_Blood_0.png",
    "Red_First_Blood_1.png",
    "Red_First_Blood_2.png",
    "Red_First_Blood_3.png",
];

const RedFirstBrickIcons = ["Red_Tower_Not_Active.png", "Red_Tower_Active.png"];

const RedKillMonsterIcons = [
    "Red_PIP_Active_0.png",
    "Red_PIP_Active_1.png",
    "Red_PIP_Active_2.png",
    "Red_PIP_Active_3.png",
];

const url = new URL(window.location.href);
url.protocol = url.protocol === "https:" ? "wss:" : "ws:";

// WebSocketサーバーのURLを指定
const webSocketServerURL = `${url.protocol}//${url.host}/ws`;

const socket = new WebSocket(webSocketServerURL);

// WebSocketが接続されたときの処理
socket.addEventListener("open", (event) => {
    console.log("WebSocket接続が開かれました: ", event);
    socket.send(JSON.stringify({ type: "request-current-data" }));
});

// WebSocketでメッセージが受信されたときの処理
socket.addEventListener("message", (event) => {
    console.log("WebSocketメッセージを受信しました: ", event.data);
    const receivedData = JSON.parse(event.data);
    if (receivedData.type === "game-stats") {
        updateHUD(receivedData.data);
    } else if (receivedData.type === "game-time") {
        updateGameTime(receivedData.data);
    } else if (receivedData.type === "hud-customize") {
        updateHudCustomize(receivedData.data);
    }
});

// WebSocketが切断されたときの処理
socket.addEventListener("close", (event) => {
    console.log("WebSocket接続が閉じられました: ", event);
});

// WebSocketでエラーが発生したときの処理
socket.addEventListener("error", (event) => {
    console.error("WebSocketエラーが発生しました: ", event);
});

function updateHUD(gameStats) {
    console.log("Updating HUD with game stats: ", gameStats);

    // ブルーチーム
    $("#OrderKill").text(gameStats.blueTeam.kills);
    $("#OrderGold").text(gameStats.blueTeam.golds);
    $("#OrderTurret").text(gameStats.blueTeam.turrets);
    $("#OrderHorde").text(gameStats.blueTeam.killHordes);
    $("#OrderFirstBlood").attr(
        "str",
        "img/feats/" +
            BlueFirstBloodIcons[gameStats.blueTeam.featsProgress.firstBloods],
    );
    $("#OrderFirstBrick").attr(
        "src",
        "img/feats/" +
            BlueFirstBrickIcons[
                Number(gameStats.blueTeam.featsProgress.firstBricks)
            ],
    );
    $("#OrderKillMonster").attr(
        "src",
        "img/feats/" +
            BlueKillMonsterIcons[gameStats.blueTeam.featsProgress.killMonsters],
    );

    // ブルーチームドラゴン
    const blueDragonArea = $("#OrderDragonArea");
    const dragons = gameStats.blueTeam.dragons; // ドラゴン名の配列
    if (dragons.length > 0) {
        // OrderDragonAreaのhiddenクラスを削除
        blueDragonArea.removeClass("hidden");
    } else {
        // dragonsが空の場合、OrderDragonAreaにhiddenクラスを追加
        blueDragonArea.addClass("hidden");
    }
    const html = `
        ${dragons
            .map(
                (dragon) =>
                    `<div class="indicators-icon-area"><img src="img/dragons/${dragon}_Dragon.png" alt="${dragon}" title="${dragon}" /></div>`,
            )
            .join("")}
    `;
    blueDragonArea.html(html);

    // ブルーチームアタカン
    const blueAtakhanArea = $("#OrderAtakhanArea");
    if (gameStats.blueTeam.killAtakhans > 0) {
        // OrderAtakhanAreaのhiddenクラスを削除
        blueAtakhanArea.removeClass("hidden");
    } else {
        // killAtakhansが0の場合、OrderAtakhanAreaにhiddenクラスを追加
        blueAtakhanArea.addClass("hidden");
    }

    // レッドチーム
    $("#ChaosKill").text(gameStats.redTeam.kills);
    $("#ChaosGold").text(gameStats.redTeam.golds);
    $("#ChaosTurret").text(gameStats.redTeam.turrets);
    $("#ChaosHorde").text(gameStats.redTeam.killHordes);
    $("#ChaosFirstBlood").attr(
        "src",
        "img/feats/" +
            RedFirstBloodIcons[gameStats.redTeam.featsProgress.firstBloods],
    );
    $("#ChaosFirstBrick").attr(
        "src",
        "img/feats/" +
            RedFirstBrickIcons[
                Number(gameStats.redTeam.featsProgress.firstBricks)
            ],
    );
    $("#ChaosKillMonster").attr(
        "src",
        "img/feats/" +
            RedKillMonsterIcons[gameStats.redTeam.featsProgress.killMonsters],
    );

    // レッドチームドラゴン
    const redDragonArea = $("#ChaosDragonArea");
    const redDragons = gameStats.redTeam.dragons; // ドラゴン名の配列
    if (redDragons.length > 0) {
        // ChaosDragonAreaのhiddenクラスを削除
        redDragonArea.removeClass("hidden");
    } else {
        // dragonsが空の場合、ChaosDragonAreaにhiddenクラスを追加
        redDragonArea.addClass("hidden");
    }
    const redHtml = `
        ${redDragons
            .map(
                (dragon) =>
                    `<div class="indicators-icon-area"><img src="img/dragons/${dragon}_Dragon.png" alt="${dragon}" title="${dragon}" /></div>`,
            )
            .join("")}
    `;
    redDragonArea.html(redHtml);

    // レッドチームアタカン
    const redAtakhanArea = $("#ChaosAtakhanArea");
    if (gameStats.redTeam.killAtakhans > 0) {
        // ChaosAtakhanAreaのhiddenクラスを削除
        redAtakhanArea.removeClass("hidden");
    } else {
        // killAtakhansが0の場合、ChaosAtakhanAreaにhiddenクラスを追加
        redAtakhanArea.addClass("hidden");
    }
}

function updateHudCustomize(customize) {
    // ブルーチーム
    $("#OrderTeamName").text(customize.blueName || "ORDER");
    if (customize.blueSubtitle) {
        $("#OrderTeamSubName").removeClass("hidden");
        $("#OrderTeamSubName").text(customize.blueSubtitle);
    } else {
        $("#OrderTeamSubName").addClass("hidden");
    }
    const blueWinScoreDots = $("#OrderWinScore .score-dot");

    // bo3の場合は2つ目まで表示
    if (customize.tournamentRule === "bo3") {
        blueWinScoreDots.eq(2).addClass("hidden");
    } else {
        blueWinScoreDots.eq(2).removeClass("hidden");
    }

    const wins = customize.blueWins || 0;
    blueWinScoreDots.each((index, element) => {
        if (index < wins) {
            $(element).addClass("active");
        } else {
            $(element).removeClass("active");
        }
    });
    $("#BlueTeamLogo").attr(
        "src",
        customize.blueLogo || "./img/blue_team_icon.png",
    );

    // レッドチーム
    $("#ChaosTeamName").text(customize.redName || "CHAOS");
    if (customize.redSubtitle) {
        $("#ChaosTeamSubName").removeClass("hidden");
        $("#ChaosTeamSubName").text(customize.redSubtitle);
    } else {
        $("#ChaosTeamSubName").addClass("hidden");
    }
    const redWinScoreDots = $("#ChaosWinScore .score-dot");

    // bo3の場合は2つ目まで表示
    if (customize.tournamentRule === "bo3") {
        redWinScoreDots.eq(2).addClass("hidden");
    } else {
        redWinScoreDots.eq(2).removeClass("hidden");
    }

    const redWins = customize.redWins || 0;
    redWinScoreDots.each((index, element) => {
        if (index < redWins) {
            $(element).addClass("active");
        } else {
            $(element).removeClass("active");
        }
    });
    $("#ChaosTeamLogo").attr(
        "src",
        customize.redLogo || "./img/red_team_icon.png",
    );

    // トーナメントロゴ
    $("#tournamentLogo").attr(
        "src",
        customize.tournamentLogo || "./img/tournament_logo.png",
    );
}

function updateGameTime(time) {
    const gameSeconds = time.seconds;
    // ゲーム時間の更新
    const minutes = Math.floor(gameSeconds / 60);
    const seconds = Math.floor(gameSeconds % 60);
    const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    $("#GameTime").text(formattedTime);
}
