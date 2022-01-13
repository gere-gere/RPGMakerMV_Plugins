//=============================================================================
// GR_MagicCountSystem.js
// 作成者     :げれげれ
// 作成日     : 2020/06/25
// 最終更新日 : 2020/06/25
// バージョン : v1.0.0
// ----------------------------------------------------------------------------
// Released under the MIT License.
// https://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc MPではなく使用回数によるスキルコスト方式を実装する
 * @author げれげれ
 *
 * @param start ID
 * @type number
 * @desc 該当するスキルの開始スキルID
 * @default 10
 *
 * @param skill type ID
 * @type number
 * @desc 該当するスキルのスキルタイプID。該当するスキルが
 * 複数系統ある場合は「skill types」で指定した数だけ連番で対象とみなします。
 * @default 1
 *
 * @param skill types
 * @type number
 * @desc 呪文の系統数
 * @default 3
 *
 * @param spells per level
 * @type number
 * @min 1
 * @max 8
 * @desc １レベル毎の呪文習得数(範囲 1～8)
 * @default 3
 *
 * @param max level
 * @type number
 * @min 3
 * @max 9
 * @desc 呪文の最大レベル(設定可能範囲3～9)
 * @default 7
 *
 * @param minimum count
 * @type number
 * @min 1
 * @max 99
 * @desc 該当呪文レベル修得時の最小使用回数（未修得の場合は0）
 * @default 3
 *
 * @param max count
 * @type number
 * @min 1
 * @max 99
 * @desc 呪文の最大使用回数
 * @default 9
 *
 * @param calculation base paramID
 * @type number
 * @min 0
 * @max 7
 * @desc 呪文の使用回数を計算する基準となるパラメータIDを指定します
 * @default 4
 *
 * @param calculation coefficient
 * @type number
 * @min 0
 * @max 10
 * @desc 呪文の使用回数を計算する際の係数。（範囲 0～10）
 * @default 5
 *
 * @param calculation bias
 * @type number
 * @min -10
 * @max 10
 * @desc 呪文の使用回数を計算する際の調整値。（範囲 -10～10）
 * @default 0
 *
 *
 * @help
 * Wizardryなどでおなじみの、呪文をMPでなく使用回数で管理するシステムです。
 *
 * なお、RPGツクール本来のMPやTPの機能は残ったままなので、本プラグインの使用回数と
 * 組み合わせて設定することも可能です。
 *
 * 設定項目がやや多いので、以下に例を挙げつつ順に解説します。
 *
 *
 * 【スキル構成に関するプラグインパラメータについて】
 * (例)呪文系統が「魔術師呪文」「僧侶呪文」「錬金呪文」の３系統であり、
 * 呪文Lvが「Lv.1～Lv.7」、１Lvあたりの呪文数を３つずつとする。
 *
 * 1) まず「start ID」がデフォルト値「10」の場合、スキルID:10のスキルが
 * 第一系統「魔術師呪文」のLv.1呪文として解釈されます。
 * そしてそれ以降、スキルID：11、12、13…のスキルが一連の魔術師呪文となります。
 * 連番として当プラグインの対象となることを覚えておいてください。
 *
 * 2) 「skill type ID」がデフォルト値「1」の場合、データベースの
 * 「タイプ ＞スキルタイプ」の01番が魔術師呪文ということになります。
 * そこから連番で02が僧侶呪文、03が錬金呪文となります。
 * スキルと同様にスキルタイプも連番で対象となるということです。
 *
 * 3) 「skill types」は呪文の系統数なので「3」、
 * 「spells per level」は１レベルあたりの呪文数なのでこれも「3」、
 * 「max level」は呪文の最大レベルであり「7」、とした場合、
 * まずスキルID「10～12」の３つのスキルが「魔術師呪文：Lv.1」、
 * スキルID「13～15」が「魔術師呪文：Lv.2」、以下繰り返して
 * スキルID「28～30」が「魔術師呪文：Lv.7」として解釈されます。
 * 結果、スキルID「10～30」が「魔術師呪文」としてプラグイン機能の
 * 対象となります。
 *
 * ※注意！：スキル設定の「スキルタイプ」は必ず上記設定と一致するように
 * 設定してください。スキル設定と上位設定が相違する場合、スキル選択画面に
 * 表示されなくなります。
 * また、上記対象範囲外のIDに「魔術師呪文」のスキルを設定してた場合も
 * 同様にスキル選択画面に表示されません。
 *
 * そして、二つ目の系統である僧侶呪文は『間を一つ空けて』、
 * スキルID「32」から対象となります。
 * つまりスキルID「32～34」が「僧侶呪文：Lv.1」、スキルID「35～37」が
 * 「僧侶呪文：Lv.2」、以下繰り返してスキルID「50～52」が「僧侶呪文：Lv.7」
 * として解釈されます。
 *
 * 『系統の境目は一つ空けて適用される』
 * という点を覚えておいてください。
 *
 * そして最後に３つ目の系統である錬金呪文は『間を一つ開けて』、
 * スキルID「54」から開始し、スキルID「74」が末尾となります。
 *
 * ※スキル構成ポイントまとめ
 * ・スキルID、スキルタイプIDは連番で対象とされる。
 * ・スキル設定の際はスキルタイプがプラグイン設定の対象範囲と一致するように注意！
 * ・スキル系統の境目は間を一つ開けて対象とされる。
 *
 *
 * 【呪文使用回数の計算に関するプラグインパラメータについて】
 * Wizardry系呪文使用回数制では、高位の呪文ほど使用回数が少なく、
 * レベルアップに応じて使用回数が増えていくのがお約束です。
 * その使用回数をどのようにして算出するのかを決定付けるのが以下の４つの
 * パラメータです。
 *
 * ・[calculation base paramID]
 * 使用回数の算出基準となる能力値です。（能力値番号は以下参照）
 * デフォルト値「4」だと「魔法力」を基準に使用回数が算出されます。
 * この能力値には装備やスキル、ステートなどによる補正は含まれません。
 *
 * [能力値番号]
 *  0 - ＨＰ
 *  1 - ＭＰ
 *  2 - 攻撃力
 *  3 - 防御力
 *  4 - 魔法力
 *  5 - 魔法防御
 *  6 - 敏捷性
 *  7 - 運
 *
 * ・[calculation coefficient][calculation bias]
 * 上記能力値を元に回数計算を行う際の「係数」と「調整値」です。
 *
 * 上記能力値 = X
 * calculation coefficient = A
 * calculation bias = B
 * とした場合、計算式は以下となります。
 *
 * 『使用回数 = (X * ((A - 呪文レベル) * 0.01 + 0.24)  + B - (呪文レベル - 2) * 1.6) * 魔法適性』
 * （※小数点以下切り捨て）
 * （※魔法適性については後述。ここでは1.0とします）
 *
 * 例えばデフォルト値どおり
 * 「calculation coefficient:5」
 * 「calculation bias:0」
 * の設定で、「魔法力20の時のLv1呪文の使用回数」は
 * 『(20 * ((5 - 1) * 0.01 + 0.24) - 0 - (1 - 2) * 1.6) * 1.0』
 * ＝ 7.2
 * →小数点以下切り捨てて「7」となります。
 *
 * 同様に魔法力20時のLv2呪文、Lv3呪文・・・Lv7呪文を計算していくと以下のようになります。
 * 「7, 5, 3, 1, 0, 0, 0」
 *
 * また、魔法力40時だと以下のようになります。
 * 「9, 9, 8, 6, 4, 2, 0」
 *
 * 感覚的には
 * 「係数を高めに設定すると能力値に依る使用回数の伸びが良くなる」
 * 「調整値は能力値に依存せずに全レベルの使用回数を上下する」
 * と認識しておくと良いでしょう。
 *
 * なお、対象レベルの呪文を一つでも修得していれば最低値として「1」は保証され、
 * 一つも修得していなければ、計算とは関係なく「0」となります。
 *
 * また、エネミーに関しては常に最大回数（max count）となります。
 *
 *
 * 【魔法適性について】
 * 能力値に大きな違いがなくとも、兼業職よりも専門職の方が呪文使用回数が多い、
 * というように職業毎に呪文使用回数に補正を掛けたい場合もあると思います。
 * その場合はデータベースの「職業」のメモ欄に以下のメモタグを設定してください。
 *
 * <magicAptitude1:スキルタイプID, 係数>
 * <magicAptitude2:スキルタイプID, 係数>
 * <magicAptitude3:スキルタイプID, 係数>
 *
 * タグは1～3まで3つ用意しましたが、必ずしも3つとも記述する必要はありません。
 * 最大で3つまで設定できる、ということです。
 *
 * [設定例]
 * 魔術師呪文（スキルタイプID：01）の適性がかなり高く、
 * 僧侶呪文（スキルタイプID：02）の適性が少しだけある職業「司祭」を設定したい場合
 *
 * <magicAptitude1:1,1.4>
 * <magicAptitude2:2,1.2>
 *
 * これを職業「司祭」のメモ欄に記入することで
 * 「魔術師呪文（スキルタイプID：01）」の使用回数は係数1.4倍（端数切り捨て）され、
 * 「僧侶呪文（スキルタイプID：02）」の使用回数は1.2倍（端数切り捨て）されます。
 * 何も指定のない他のスキルタイプについては係数１倍（つまり計算式そのまま）です。
 *
 * また、上記メモタグは職業だけでなくスキルにも指定可能です。
 * スキルのメモ欄に上記メモタグを設定することで、そのスキルを所持するアクターの
 * 使用回数を調整するパッシブスキルのように利用できます。
 *
 * タグ未設定の場合は「1.0」として判断されます。
 * そして職業とスキルの係数を比較し、係数の高い方が優先されます。
 * つまり係数1未満、たとえばスキル側に係数0.9を設定しても、職業側が未設定の場合は
 * 職業側の係数1.0が有効となるため、スキル側の係数は無視されます。
 *
 *【プラグインコマンド】
 * GR_MagicRecover アクターID
 *  アクターIDで指定したアクターの魔法使用回数を全回復します。
 *  アクターIDの箇所を「All」とした場合はパーティメンバー全員を全回復します。
 *  宿屋などの回復イベントにご使用ください。
 *
 *   記述例）
 *     GR_MagicRecover 1    #アクターID：1のアクターの魔法使用回数を全回復します。
 *     GR_MagicRecover All  #パーティに含まれているアクター全員の魔法使用回数を全回復します。
 *
 *
 */

//==============================================================================

(function () {
  'use strict';

  //プラグインパラメータの取得
  const PARAMETERS = PluginManager.parameters('GR_MagicCountSystem');
  const START_ID = Number(PARAMETERS['start ID']);
  const SKILL_TYPE_ID = Number(PARAMETERS['skill type ID']);
  const SKILL_TYPES = Number(PARAMETERS['skill types']);
  const SPELLS_PER_LEVEL = Number(PARAMETERS['spells per level']);
  const MAX_LEVEL = Number(PARAMETERS['max level']);
  const MINIMUM_COUNT = Number(PARAMETERS['minimum count']);
  const MAX_COUNT = Number(PARAMETERS['max count']);
  const CALCULATION_BASE_PARAMID = Number(PARAMETERS['calculation base paramID']);
  const CALCULATION_COEFFICIENT = Number(PARAMETERS['calculation coefficient']);
  const CALCULATION_BIAS = Number(PARAMETERS['calculation bias']);

  // プラグインコマンド======================================
  let _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    let commandUpperCase = command.toUpperCase();
    if (commandUpperCase === 'GR_MAGICRECOVER') {
      let argsUpperCase = args[0].toUpperCase();
      switch (argsUpperCase) {
        case 'ALL':
          $gameParty._actors.forEach((actorId) => {
            $gameActors.actor(actorId).magicFullRecover();
          });
          break;
        default:
          let actorId = Number(args[0]);
          $gameActors.actor(actorId).magicFullRecover();
          break;
      }
    }
  };

  // 独自関数 ======================================================================
  //選択したスキルタイプが当プラグインの対象範囲か
  let checkSkillTypeForThis = function (skillType) {
    return skillType >= SKILL_TYPE_ID && skillType < SKILL_TYPE_ID + SKILL_TYPES;
  };

  //スキルからtypeを取得、当プラグイン対象外の場合は-1を返す
  let getMagicType = function (skill) {
    let type = skill.stypeId - SKILL_TYPE_ID;
    if (type < 0) type = -1;
    if (type > SKILL_TYPES - 1) type = -1;
    return type;
  };

  //スキルから呪文レベルを取得、当プラグイン対象外の場合は-1を返す
  let getMagicLevel = function (skill) {
    let type = getMagicType(skill);
    if (type == -1) return -1;
    let level =
      Math.floor(
        (skill.id - START_ID - (SPELLS_PER_LEVEL * MAX_LEVEL + 1) * type) / SPELLS_PER_LEVEL
      ) + 1;
    return level;
  };

  // Game_BattlerBaseにコスト管理処理を追加 ===============================================
  let _game_battlerBase_paySkillCost = Game_BattlerBase.prototype.paySkillCost;
  Game_BattlerBase.prototype.paySkillCost = function (skill) {
    _game_battlerBase_paySkillCost.call(this, skill);

    let type = getMagicType(skill);
    if (type == -1) return;
    let level = getMagicLevel(skill) - 1;
    this._magicCount[type][level] -= 1;
  };

  // Game_Battlerに各処理、プロパティ等を追加 =============================================
  //Game_Battlerに最大魔法使用回数と残魔法使用回数のプロパティを追加
  let _game_battler_initialize = Game_Battler.prototype.initialize;
  Game_Battler.prototype.initialize = function () {
    _game_battler_initialize.call(this);
    this._maxMagicCount = new Array(SKILL_TYPES);
    this._magicCount = new Array(SKILL_TYPES);
    for (let i = 0; i < SKILL_TYPES; i++) {
      this._maxMagicCount[i] = new Array(MAX_LEVEL);
      this._magicCount[i] = new Array(MAX_LEVEL);
      for (let j = 0; j < MAX_LEVEL; j++) {
        this._maxMagicCount[i][j] = 0;
        this._magicCount[i][j] = 0;
      }
    }
  };

  //魔力全回復メソッド
  Game_Battler.prototype.magicFullRecover = function () {
    this._magicCount.forEach((arr, i) => {
      this._magicCount[i] = arr.map((elem, j) => this._maxMagicCount[i][j]);
    });
  };

  //該当する種類、レベルの呪文を修得しているかチェック
  Game_Battler.prototype.isLearnedMagic = function (type, level) {
    let result = false;
    let tempSkillId =
      START_ID + type * (SPELLS_PER_LEVEL * MAX_LEVEL + 1) + (level - 1) * SPELLS_PER_LEVEL;
    for (let i = 0; i < SPELLS_PER_LEVEL; i++) {
      if (this.isLearnedSkill(tempSkillId + i)) {
        result = true;
        break;
      }
    }
    return result;
  };

  //該当する種類の呪文を一つでも修得しているかチェック
  Game_Battler.prototype.isLearnedMagicType = function (type) {
    let result = false;
    for (let i = 1; i < MAX_LEVEL + 1; i++) {
      if (this.isLearnedMagic(type, i)) {
        result = true;
        break;
      }
    }
    return result;
  };

  //アクターの魔法適性を取得
  Game_Battler.prototype.getAptitude = function (type) {
    let aptitude = this.getClassMeta(type);
    let skillAptitude = this.getSkillMeta(type);
    if (aptitude < skillAptitude) aptitude = skillAptitude;
    return aptitude;
  };

  //職業のメモタグから魔法適性を取得
  Game_Battler.prototype.getClassMeta = function (type) {
    let aptitude = 1.0;
    let skillTypeId = SKILL_TYPE_ID + type;
    let job = $dataClasses[this._classId];
    //タグ一つ目
    if (job.meta.magicAptitude1) {
      let metaTypeId = Number(job.meta.magicAptitude1.split(',')[0]);
      let metaAptitude = Number(job.meta.magicAptitude1.split(',')[1]);
      if (skillTypeId == metaTypeId) aptitude *= metaAptitude;
    }
    //タグ二つ目
    if (job.meta.magicAptitude2) {
      let metaTypeId = Number(job.meta.magicAptitude2.split(',')[0]);
      let metaAptitude = Number(job.meta.magicAptitude2.split(',')[1]);
      if (skillTypeId == metaTypeId) aptitude *= metaAptitude;
    }
    //タグ三つ目
    if (job.meta.magicAptitude3) {
      let metaTypeId = Number(job.meta.magicAptitude3.split(',')[0]);
      let metaAptitude = Number(job.meta.magicAptitude3.split(',')[1]);
      if (skillTypeId == metaTypeId) aptitude *= metaAptitude;
    }
    return aptitude;
  };

  //スキルのメモタグから魔法適性を取得
  Game_Battler.prototype.getSkillMeta = function (type) {
    let aptitude = 1.0;
    let skillTypeId = SKILL_TYPE_ID + type;
    this._skills.forEach((skillId) => {
      let skill = $dataSkills[skillId];
      //タグ一つ目
      if (skill.meta.magicAptitude1) {
        let metaTypeId = Number(skill.meta.magicAptitude1.split(',')[0]);
        let metaAptitude = Number(skill.meta.magicAptitude1.split(',')[1]);
        if (skillTypeId == metaTypeId) aptitude *= metaAptitude;
      }
      //タグ二つ目
      if (skill.meta.magicAptitude2) {
        let metaTypeId = Number(skill.meta.magicAptitude2.split(',')[0]);
        let metaAptitude = Number(skill.meta.magicAptitude2.split(',')[1]);
        if (skillTypeId == metaTypeId) aptitude *= metaAptitude;
      }
      //タグ三つ目
      if (skill.meta.magicAptitude3) {
        let metaTypeId = Number(skill.meta.magicAptitude3.split(',')[0]);
        let metaAptitude = Number(skill.meta.magicAptitude3.split(',')[1]);
        if (skillTypeId == metaTypeId) aptitude *= metaAptitude;
      }
    });
    return aptitude;
  };

  //アクターの能力に応じたmaxMagicCountの計算と設定(一種のみ)
  Game_Battler.prototype.maxMagicCalc = function (type) {
    //そもそも該当呪文系統を習得しているか（未修得の場合はfalse返して終わり）
    if (!this.isLearnedMagicType(type)) return false;
    //魔法適性係数をセット
    let aptitude = this.getAptitude(type);
    //実計算開始
    for (let i = 0; i < MAX_LEVEL; i++) {
      let tempNum = 0;
      //該当系統の呪文を習得している場合のみ計算
      if (this.isLearnedMagic(type, i + 1)) {
        tempNum = Math.floor(
          (this.param(CALCULATION_BASE_PARAMID) *
            ((CALCULATION_COEFFICIENT - i - 1) * 0.01 + 0.24) +
            CALCULATION_BIAS -
            (i - 1) * 1.9) *
            aptitude
        );
        if (tempNum < MINIMUM_COUNT) tempNum = MINIMUM_COUNT;
        if (tempNum > MAX_COUNT) tempNum = MAX_COUNT;
      }
      this._maxMagicCount[type][i] = tempNum;
    }
  };

  // 全種呪文に対して
  Game_Battler.prototype.maxMagicCalcAll = function () {
    for (let i = 0; i < SKILL_TYPES; i++) {
      this.maxMagicCalc(i);
    }
  };

  //スキルコストの確認をオーバーライド
  let Game_Battler_canPaySkillCost = Game_Battler.prototype.canPaySkillCost;
  Game_Battler.prototype.canPaySkillCost = function (skill) {
    let checkMpTp = Game_Battler_canPaySkillCost.call(this, skill);
    let type = getMagicType(skill);
    if (type == -1) return checkMpTp;
    let level = getMagicLevel(skill) - 1;
    let checkCount = this._magicCount[type][level] > 0;
    return checkMpTp && checkCount;
  };

  // Game_actorのlevelUp時に使用回数を再計算=============================================
  let _game_actor_levelUp = Game_Actor.prototype.levelUp;
  Game_Actor.prototype.levelUp = function () {
    _game_actor_levelUp.call(this);
    this.maxMagicCalcAll();
  };

  // Game_Actorのセットアップ時に魔法使用回数をセット =====================================
  let _game_actor_setup = Game_Actor.prototype.setup;
  Game_Actor.prototype.setup = function (actorId) {
    _game_actor_setup.call(this, actorId);
    this.maxMagicCalcAll();
    this.magicFullRecover();
  };

  // Game_Enemy側の各種処理 ==========================================================
  //Game_Enemyは常に最大値
  let _game_enemy_setup = Game_Enemy.prototype.setup;
  Game_Enemy.prototype.setup = function (enemyId, x, y) {
    _game_enemy_setup.call(this, enemyId, x, y);
    this._maxMagicCount.forEach((arr, i) => {
      this._maxMagicCount[i] = arr.map(() => MAX_COUNT);
    });
    this.magicFullRecover();
  };

  //メニュー画面=====================================================================
  //Sceneクラス=================================================================
  //Scene_Skillに使用回数画面と_modeプロパティを追加
  let _scene_skill_initialize = Scene_Skill.prototype.initialize;
  Scene_Skill.prototype.initialize = function () {
    _scene_skill_initialize.call(this);
    this._mode = 0; //0が通常のスキル処理モード、1が当プラグイン対象のスキル処理モード
  };

  let _scene_skill_create = Scene_Skill.prototype.create;
  Scene_Skill.prototype.create = function () {
    _scene_skill_create.call(this);
    this.createMagicCountWindow();
  };

  let _scene_skill_createItemWindow = Scene_Skill.prototype.createItemWindow;
  Scene_Skill.prototype.createItemWindow = function () {
    _scene_skill_createItemWindow.call(this);
    this._itemWindow._parentScene = this;
  };

  Scene_Skill.prototype.createMagicCountWindow = function () {
    let wx = 404 - MAX_LEVEL * 41;
    let wy = 226;
    let ww = 10 + MAX_LEVEL * 82;
    let wh = 72;
    this._countWindow = new Window_MagicCount(wx, wy, ww, wh);

    this._countWindow.setHandler('push', this.onCountPush.bind(this));
    this._countWindow.setHandler('cancel', this.onCountCancel.bind(this));
    this._countWindow.setSkillWindow(this._itemWindow);
    this._countWindow._parentScene = this;

    this._countWindow.hide();
    this._countWindow.deactivate();
    this._countWindow.close();

    this.addWindow(this._countWindow);
  };

  //Windw_SkillTypeで選択されたスキルタイプが当プラグイン対象の場合、使用回数Windowを割り込ませる
  let _scene_skill_commandskill = Scene_Skill.prototype.commandSkill;
  Scene_Skill.prototype.commandSkill = function () {
    let skillType = this._skillTypeWindow.currentExt();
    if (checkSkillTypeForThis(skillType)) {
      this._mode = 1;
      this._countWindow.refresh();
      this._countWindow.show();
      this._countWindow.select(0);
      this._countWindow.open();
      this._itemWindow.refresh();
      this._countWindow.activate();
    } else {
      this._mode = 0;
      _scene_skill_commandskill.call(this);
    }
  };

  //Window_MagicCountでの操作処理
  Scene_Skill.prototype.onCountPush = function () {
    this._countWindow.deactivate();
    this._countWindow.close();
    this._countWindow.hide();

    this._itemWindow.activate();
    this._itemWindow.selectLast();
  };

  Scene_Skill.prototype.onCountCancel = function () {
    this._mode = 0;
    this._countWindow.deactivate();
    this._countWindow.close();
    this._countWindow.hide();

    this._skillTypeWindow.activate();
  };

  //Window_SkillListでキャンセルされた際、mode=1ならばWindow_MagicCountをアクティブにする。
  let _scene_skill_onItemCancel = Scene_Skill.prototype.onItemCancel;
  Scene_Skill.prototype.onItemCancel = function () {
    if (this._mode == 1) {
      this._itemWindow.deselect();
      this._countWindow.show();
      this._countWindow.open();
      this._countWindow.activate();
    } else {
      _scene_skill_onItemCancel.call(this);
    }
  };

  //_actorWindowでOKの際、mode=1ならば_countWindowをリフレッシュするようオーバーライド
  Scene_Skill.prototype.onActorOk = function () {
    if (this.canUse()) {
      this.useItem();
      if (this._mode == 1 && !this.actor().canPaySkillCost(this.item())) {
        this.hideSubWindow(this._actorWindow);
        this._countWindow.refresh();
        this._countWindow.show();
        this._countWindow.open();
        this._countWindow.activate();
        this._itemWindow.deactivate();
      }
    } else {
      SoundManager.playBuzzer();
    }
  };

  // modeに応じて使用回数を考慮に入れるようオーバーライド
  Scene_Skill.prototype.canUse = function () {
    return this.user().canUse(this.item()) && this.isItemEffectsValid();
  };

  //Windowクラス================================================================
  //使用回数表示ウィンドウ、水平コマンドウインドウから継承
  function Window_MagicCount() {
    this.initialize.apply(this, arguments);
  }

  Window_MagicCount.prototype = Object.create(Window_HorzCommand.prototype);
  Window_MagicCount.prototype.constructor = Window_MagicCount;

  //初期化時にmakeCommandList、refreshを実行しないようにオーバーライド
  Window_MagicCount.prototype.initialize = function (x, y, w, h) {
    this.clearCommandList();
    Window_Selectable.prototype.initialize.call(this, x, y, w, h);
    this.select(0);
  };

  //update時にWindow_SkillListへスキルレベルを渡す
  Window_MagicCount.prototype.update = function () {
    Window_HorzCommand.prototype.update.call(this);
    if (this._skillWindow) {
      this._skillWindow.setSkillLevel(this.index() + 1);
    }
  };

  Window_MagicCount.prototype.maxCols = function () {
    return MAX_LEVEL;
  };

  Window_MagicCount.prototype.setSkillWindow = function (skillWindow) {
    this._skillWindow = skillWindow;
  };

  //使用回数ウインドウのリスト作成
  Window_MagicCount.prototype.makeCommandList = function () {
    let actor = null;
    let skillType = 0;
    //親シーンがScene_SkillかScene_Battleなのかを_skillTypeWindowの有無で確認
    if (this._parentScene._skillTypeWindow) {
      actor = this._parentScene._actor;
      skillType = this._parentScene._skillTypeWindow.currentExt();
    } else {
      actor = this._parentScene._actorCommandWindow._actor;
      skillType = this._parentScene._actorCommandWindow.currentExt();
    }
    let type = skillType - SKILL_TYPE_ID;
    for (let i = 0; i < MAX_LEVEL; i++) {
      let checkEnable = !(actor._magicCount[type][i] == 0);
      let numberPerNumber = `${actor._magicCount[type][i]}/${actor._maxMagicCount[type][i]}`;
      this.addCommand(numberPerNumber, 'push', checkEnable);
    }
  };

  //Window_SkillList側の処理
  //_skillLevelプロパティを追加
  let _window_skilllist_initialize = Window_SkillList.prototype.initialize;
  Window_SkillList.prototype.initialize = function (x, y, width, height) {
    _window_skilllist_initialize.call(this, x, y, width, height);
    this._skillLevel = 0;
  };

  //Window_MagicCountからWindow_SkillListに呪文レベルをセットしてリフレッシュ
  Window_SkillList.prototype.setSkillLevel = function (skillLevel) {
    if (this._skillLevel !== skillLevel) {
      this._skillLevel = skillLevel;
      this.refresh();
      this.resetScroll();
    }
  };

  //モード=1の時は選択レベル（_skillLevel）のスキルのみ描画
  let _window_skillList_makeItemList = Window_SkillList.prototype.makeItemList;
  Window_SkillList.prototype.makeItemList = function () {
    if (this._parentScene) {
      let mode = this._parentScene._mode;
      let checkOpen = this._parentScene._countWindow.isOpen();
      if (mode == 1) {
        if (this._actor) {
          this._data = this._actor.skills().filter(function (item) {
            return this.includes(item) && this.checkSkillLevel(item);
          }, this);
        } else {
          this._data = [];
        }
      } else {
        _window_skillList_makeItemList.call(this);
      }
    }
  };

  //対象のスキルが指定された呪文レベルに該当するか
  Window_SkillList.prototype.checkSkillLevel = function (item) {
    if (item) {
      let itemId = item.id;
      let skillLevel = this._skillLevel;
      let skillType = null;
      //親シーンがScene_SkillなのかScene_Battleなのかを_parentSceneの有無で確認
      if (this._parentScene._skillTypeWindow) {
        skillType = this._parentScene._skillTypeWindow.currentExt();
      } else {
        skillType = this._parentScene._actorCommandWindow.currentExt();
      }
      let type = skillType - SKILL_TYPE_ID; //0から開始するインデックス番号に変換
      //該当レベルのスキルID開始位置と終了位置
      let scopeStart =
        START_ID + (SPELLS_PER_LEVEL * MAX_LEVEL + 1) * type + (skillLevel - 1) * SPELLS_PER_LEVEL;
      let scopeEnd = scopeStart + SPELLS_PER_LEVEL - 1;
      if (itemId >= scopeStart && itemId <= scopeEnd) return true;
    }
    return false;
  };

  // バトル画面=====================================================================
  //Sceneクラス=================================================================
  //modeプロパティを追加
  let _scene_battle_initialize = Scene_Battle.prototype.initialize;
  Scene_Battle.prototype.initialize = function () {
    _scene_battle_initialize.call(this);
    this._mode = 0; //0が通常のスキル処理モード、1が当プラグイン対象のスキル処理モード
  };

  //使用回数ウインドウ作成処理を追加
  let _scene_battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
  Scene_Battle.prototype.createAllWindows = function () {
    _scene_battle_createAllWindows.call(this);
    this.createMagicCountWindow();
  };

  //_skillWindowに_parentSceneプロパティを追加
  let _scene_battle_createSkillWindow = Scene_Battle.prototype.createSkillWindow;
  Scene_Battle.prototype.createSkillWindow = function () {
    _scene_battle_createSkillWindow.call(this);
    this._skillWindow._parentScene = this;
  };

  Scene_Battle.prototype.createMagicCountWindow = function () {
    let wx = 404 - MAX_LEVEL * 41;
    let wy = 290;
    let ww = 10 + MAX_LEVEL * 82;
    let wh = 72;
    this._countWindow = new Window_MagicCount(wx, wy, ww, wh);

    this._countWindow.setHandler('push', this.onCountPush.bind(this));
    this._countWindow.setHandler('cancel', this.onCountCancel.bind(this));
    this._countWindow.setSkillWindow(this._skillWindow);
    this._countWindow._parentScene = this;

    this._countWindow.hide();
    this._countWindow.deactivate();
    this._countWindow.close();

    this.addWindow(this._countWindow);
  };

  //_countWindowも入力ウインドウ監視に追加
  Scene_Battle.prototype.isAnyInputWindowActive = function () {
    return (
      this._partyCommandWindow.active ||
      this._actorCommandWindow.active ||
      this._skillWindow.active ||
      this._countWindow.active ||
      this._itemWindow.active ||
      this._actorWindow.active ||
      this._enemyWindow.active
    );
  };

  //Window_ActorCommandで選択されたスキルタイプが当プラグイン対象の場合、使用回数Windowを割り込ませる
  Scene_Battle.prototype.commandSkill = function () {
    let skillType = this._actorCommandWindow.currentExt();
    let checkType = checkSkillTypeForThis(skillType);
    this._skillWindow.setActor(BattleManager.actor());
    this._skillWindow.setStypeId(skillType);
    this._actorCommandWindow.deactivate();

    if (checkType) {
      this._mode = 1;
      this._skillWindow.setSkillLevel(this._countWindow.index() + 1);
      this._skillWindow.refresh();
      this._skillWindow.show();
      this._skillWindow.deselect();
      this._helpWindow.clear();
      this._countWindow.refresh();
      this._countWindow.show();
      this._countWindow.open();
      this._countWindow.select(0);
      this._countWindow.activate();
    } else {
      this._mode = 0;
      this._skillWindow.refresh();
      this._skillWindow.show();
      this._skillWindow.activate();
    }
  };

  //Window_MagicCountでの操作処理
  Scene_Battle.prototype.onCountPush = function () {
    this._countWindow.deactivate();
    this._countWindow.close();
    this._countWindow.hide();

    this._skillWindow.activate();
    this._skillWindow.selectLast();
  };

  Scene_Battle.prototype.onCountCancel = function () {
    this._mode = 0;
    this._countWindow.deactivate();
    this._countWindow.close();
    this._countWindow.hide();
    this._skillWindow.hide();

    this._actorCommandWindow.activate();
  };

  //Window_BattleSkillでキャンセルされた際、mode=1ならばWindow_MagicCountをアクティブにする。
  let _scene_battle_onSkillCancel = Scene_Battle.prototype.onSkillCancel;
  Scene_Battle.prototype.onSkillCancel = function () {
    if (this._mode == 1) {
      this._skillWindow.deselect();
      this._helpWindow.clear();
      this._countWindow.show();
      this._countWindow.open();
      this._countWindow.activate();
    } else {
      _scene_battle_onSkillCancel.call(this);
    }
  };

  //Windowクラス================================================================
  //処理なし
})();
