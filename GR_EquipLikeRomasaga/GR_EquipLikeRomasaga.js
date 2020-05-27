//=============================================================================
// GR_EquipLikeRomasaga.js
// 作成者     :げれげれ 
// 作成日     : 2020/04/24
// 最終更新日 : 2020/04/24
// バージョン : v1.0.0
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
 * （データベースで二刀流を設定してても無視します）
 * 「最強装備」も非対応です。
 * また、装飾品だけ専用の固定枠を一つ用意しています。
 * 
 *【プラグインコマンド】
 * ありません。
 * 
 */

//==============================================================================
(function(){

/*　プラグインパラメータの取得　*/
var parameters = PluginManager.parameters('GR_EquipLikeRomasaga');
var accessoryId = Number(parameters['AccessoryID']);

//　メニュー画面からの装備シーン呼び出しを、装備シーン改へ変更
var _Scene_Menu_onPersonalOk = Scene_Menu.prototype.onPersonalOk;
Scene_Menu.prototype.onPersonalOk = function() {
    if(this._commandWindow.currentSymbol() == 'equip') {
        SceneManager.push(Scene_EquipCustom);
    } else {
        _Scene_Menu_onPersonalOk.call(this);
    }
};

//　装備変更時のアイテム装備タイプが装備スロットと不一致でも変更可能に改変
Game_Actor.prototype.changeEquip = function(slotId, item) {
    if (this.tradeItemWithParty(item, this.equips()[slotId]))  {
        this._equips[slotId].setObject(item);
        this.refresh();
    }
};

//　Game_Actorのrefresh時に装備タイプをチェックしないように改変
Game_Actor.prototype.releaseUnequippableItems = function(forcing) {
    for (;;) {
        var slots = this.equipSlots();
        var equips = this.equips();
        var changed = false;
        for (var i = 0; i < equips.length; i++) {
            var item = equips[i];
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

//　シーン定義
function Scene_EquipCustom() {
    this.initialize.apply(this, arguments);
}

Scene_EquipCustom.prototype = Object.create(Scene_Equip.prototype);
Scene_EquipCustom.prototype.constructor = Scene_EquipCustom;

Scene_EquipCustom.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

//　コマンドウインドウをコマンドウインドウ改に変更（最強装備を削除）
Scene_EquipCustom.prototype.createCommandWindow = function() {
    var wx = this._statusWindow.width;
    var wy = this._helpWindow.height;
    var ww = Graphics.boxWidth - this._statusWindow.width;
    this._commandWindow = new Window_EquipCommandCustom(wx, wy, ww);
    this._commandWindow.setHelpWindow(this._helpWindow);
    this._commandWindow.setHandler('equip',    this.commandEquip.bind(this));
    this._commandWindow.setHandler('clear',    this.commandClear.bind(this));
    this._commandWindow.setHandler('cancel',   this.popScene.bind(this));
    this._commandWindow.setHandler('pagedown', this.nextActor.bind(this));
    this._commandWindow.setHandler('pageup',   this.previousActor.bind(this));
    this.addWindow(this._commandWindow);
};

//　スロットウインドウをスロットウインドウ改に変更
Scene_EquipCustom.prototype.createSlotWindow = function() {
    var wx = this._statusWindow.width;
    var wy = this._commandWindow.y + this._commandWindow.height;
    var ww = Graphics.boxWidth - this._statusWindow.width;
    var wh = this._statusWindow.height - this._commandWindow.height;
    this._slotWindow = new Window_EquipSlotCustom(wx, wy, ww, wh);
    this._slotWindow.setHelpWindow(this._helpWindow);
    this._slotWindow.setStatusWindow(this._statusWindow);
    this._slotWindow.setHandler('ok',       this.onSlotOk.bind(this));
    this._slotWindow.setHandler('cancel',   this.onSlotCancel.bind(this));
    this.addWindow(this._slotWindow);
};

//　アイテムウインドウをアイテムウインドウ改に変更
Scene_EquipCustom.prototype.createItemWindow = function() {
    var wx = 0;
    var wy = this._statusWindow.y + this._statusWindow.height;
    var ww = Graphics.boxWidth;
    var wh = Graphics.boxHeight - wy;
    this._itemWindow = new Window_EquipItemCustom(wx, wy, ww, wh);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setStatusWindow(this._statusWindow);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
    this._slotWindow.setItemWindow(this._itemWindow);
    this.addWindow(this._itemWindow);
};

//　コマンドウインドウ改の定義
function Window_EquipCommandCustom() {
    this.initialize.apply(this, arguments);
}

Window_EquipCommandCustom.prototype = Object.create(Window_EquipCommand.prototype);
Window_EquipCommandCustom.prototype.constructor = Window_EquipCommandCustom;

Window_EquipCommandCustom.prototype.makeCommandList = function() {
    this.addCommand(TextManager.equip2,   'equip');
    this.addCommand(TextManager.clear,    'clear');
};

//　スロットウインドウ改の定義
function Window_EquipSlotCustom() {
    this.initialize.apply(this, arguments);
}

Window_EquipSlotCustom.prototype = Object.create(Window_EquipSlot.prototype);
Window_EquipSlotCustom.prototype.constructor = Window_EquipSlotCustom;

Window_EquipSlotCustom.prototype.update = function() {
    Window_Selectable.prototype.update.call(this);
    if (this._itemWindow) {
        this._itemWindow.setSlotId(this.index());
    }
};

Window_EquipSlotCustom.prototype.maxItems = function() {
    return 5;
};

Window_EquipSlotCustom.prototype.slotName = function(index) {
    var slots = this._actor.equipSlots();
    if(this._actor) {
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
    } else {
        return '';
    }
};

Window_EquipSlotCustom.prototype.isEnabled = function(index) {
    return true;
};

//　アイテムウインドウ改の定義
function Window_EquipItemCustom() {
    this.initialize.apply(this, arguments);
}

Window_EquipItemCustom.prototype = Object.create(Window_EquipItem.prototype);
Window_EquipItemCustom.prototype.constructor = Window_EquipItemCustom;

Window_EquipItemCustom.prototype.includes = function(item) {
    if (item === null) return true;
    if (this._slotId < 0) return false;
    if (this._slotId == 0 && item.etypeId !== 1) return false;

    //　既に装備している装備タイプを取得、ただし装飾の場合は0とする
    var alreadyEtype = [];
    var equips = this._actor.equips();
    for(i = 1; i < 4; i++) {
        if (equips[i]) {
            alreadyEtype[i] = equips[i].etypeId;
            if(alreadyEtype[i] == accessoryId) alreadyEtype[i] = 0; 
        } else {
            alreadyEtype[i] = 0;    //　装備欄がnullだった場合も0
        }
    }

    //　防具枠（slotIDが１以上）を選択中の場合は、武器は除外
    if (this._slotId > 0 && item.etypeId == 1) return false;
    
    //　既に装備している防具と重複していれば除外
    switch (this._slotId) {
        case 1:
            if(item.etypeId == alreadyEtype[2] || item.etypeId == alreadyEtype[3]) return false;
            break;
        case 2:
            if(item.etypeId == alreadyEtype[1] || item.etypeId == alreadyEtype[3]) return false;
            break;
        case 3:
            if(item.etypeId == alreadyEtype[1] || item.etypeId == alreadyEtype[2]) return false;
            break;
    }

    //　５番目の装備枠は装飾固定
    if(this._slotId == 4 && item.etypeId !== accessoryId) return false;
    
    return this._actor.canEquip(item);
};

})();