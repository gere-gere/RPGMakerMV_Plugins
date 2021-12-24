//=============================================================================
// GR_EquipLikeRomasaga.js
// 作成者     :げれげれ
// 作成日     : 2020/04/24
// 最終更新日 : 2021/10/04
// バージョン : v1.1.0
// ----------------------------------------------------------------------------
// Released under the MIT License.
// https://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 防具の装備枠を固定でなく、枠数内で任意の組み合わせとする
 * @author げれげれ
 *
 * @param AccessoryID
 * @desc 装飾品（重複して装備可能な防具）の装備タイプID
 * @default 5
 *
 * @help
 * 防具の装備枠を、固定タイプでなく任意の組み合わせで
 * 装備できるようにするプラグイン。
 * （つまりロマサガのような感じです）
 * ただし、二刀流には非対応。
 * （データベースで二刀流を設定していても無視します）
 * 「最強装備」も非対応です。項目が除外されます。
 * また、装飾品だけ専用の固定枠を一つ用意しています。
 *
 *
 *【プラグインコマンド】
 * ありません。
 *
 */

//==============================================================================
(function () {
  /* プラグインパラメータの取得 */
  const parameters = PluginManager.parameters('GR_EquipLikeRomasaga');
  const accessoryId = Number(parameters['AccessoryID']);

  // 装備変更時のアイテム装備タイプが装備スロットと不一致でも変更可能に
  Game_Actor.prototype.changeEquip = function (slotId, item) {
    if (this.tradeItemWithParty(item, this.equips()[slotId])) {
      this._equips[slotId].setObject(item);
      this.refresh();
    }
  };

  // Game_Actorのrefresh時に装備タイプをチェックしない
  Game_Actor.prototype.releaseUnequippableItems = function (forcing) {
    for (;;) {
      const equips = this.equips();
      const changed = false;
      for (let i = 0; i < equips.length; i++) {
        const item = equips[i];
        if (item && !this.canEquip(item)) {
          if (!forcing) {
            this.tradeItemWithParty(null, item);
          }
          this._equips[i].setObject(null);
          changed = true;
        }
      }
      if (!changed) {
        break;
      }
    }
  };

  // 各種ウインドウの修正
  // コマンドウインドウから「最強装備」を削る
  Window_EquipCommand.prototype.makeCommandList = function () {
    this.addCommand(TextManager.equip2, 'equip');
    this.addCommand(TextManager.clear, 'clear');
  };

  // 装備スロットを５つに固定
  Window_EquipSlot.prototype.maxItems = function () {
    return 5;
  };

  // 装備枠表示も固定化
  Window_EquipSlot.prototype.slotName = function (index) {
    const slots = this._actor.equipSlots();
    switch (index) {
      case 0:
        return '武器';
        break;
      case 1:
        return '防具１';
        break;
      case 2:
        return '防具２';
        break;
      case 3:
        return '防具３';
        break;
      case 4:
        return '装飾';
        break;
    }
  };

  // 装備固定も無効に
  Window_EquipSlot.prototype.isEnabled = function () {
    return true;
  };

  // 装備アイテムウインドウにおいて、現在装備しているアイテムを考慮して表示アイテムを抽出する
  Window_EquipItem.prototype.includes = function (item) {
    if (item === null) return true;
    if (this._slotId < 0) return false;
    if (this._slotId === 0 && item.etypeId !== 1) return false;

    // 既に装備している装備タイプを取得、ただし装飾の場合は0とする
    const alreadyEtype = [];
    const equips = this._actor.equips();
    for (i = 1; i < 4; i++) {
      if (equips[i]) {
        alreadyEtype[i] = equips[i].etypeId;
        if (alreadyEtype[i] === accessoryId) alreadyEtype[i] = 0;
      } else {
        alreadyEtype[i] = 0; // 装備欄がnullだった場合も0
      }
    }

    // 防具枠（slotIDが１以上）を選択中の場合は、武器は除外
    if (this._slotId >= 1 && item.etypeId === 1) return false;

    // 既に装備している防具と重複していれば除外
    switch (this._slotId) {
      case 1:
        if (item.etypeId == alreadyEtype[2] || item.etypeId == alreadyEtype[3]) return false;
        break;
      case 2:
        if (item.etypeId == alreadyEtype[1] || item.etypeId == alreadyEtype[3]) return false;
        break;
      case 3:
        if (item.etypeId == alreadyEtype[1] || item.etypeId == alreadyEtype[2]) return false;
        break;
    }

    // ５番目の装備枠は装飾固定
    if (this._slotId == 4 && item.etypeId !== accessoryId) return false;

    return this._actor.canEquip(item);
  };

  // ショップのステータス差分をスロット基準でなく同部位装備との比較に変更
  Window_ShopStatus.prototype.currentEquippedItem = function (actor, etypeId) {
    const list = [];
    const equips = actor.equips();
    for (let i = 0; i < equips.length; i++) {
      if (equips[i] && equips[i].etypeId === etypeId) {
        list.push(equips[i]);
      }
    }
    const paramId = this.paramId();
    let worstParam = Number.MAX_VALUE;
    let worstItem = null;
    for (let j = 0; j < list.length; j++) {
      if (list[j] && list[j].params[paramId] < worstParam) {
        worstParam = list[j].params[paramId];
        worstItem = list[j];
      }
    }
    return worstItem;
  };
})();
