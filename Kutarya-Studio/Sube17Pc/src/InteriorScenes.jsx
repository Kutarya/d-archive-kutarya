import { useEffect, useRef, useState } from 'react';
import { currentCustomer, startShift } from './game/engine.js';
import { Hotspot, SceneDialog, SceneStage } from './SceneInteraction.jsx';
import './interior-scenes.css';

export function customerSpriteIndex(person) {
  const female = ['Aylin', 'Selin', 'Derya', 'Bahar', 'Suna', 'İpek', 'Gül', 'Nalan'].includes(person.name.split(' ')[0]);
  return female ? (person.job === 'Hemşire' ? 4 : person.job === 'Terzi' ? 0 : 2) : (person.job === 'Fırıncı' ? 1 : person.job === 'Demiryolu işçisi' || person.job === 'Tamirci' ? 3 : 5);
}

export function BankScene({ game, onChange, onNavigate, renderBank, renderRules }) {
  const [panel, setPanel] = useState(null);
  const customer = currentCustomer(game);
  const previousCustomer = useRef(customer?.uid);
  useEffect(() => { if (previousCustomer.current !== customer?.uid) { if (panel === 'file') setPanel(null); previousCustomer.current = customer?.uid; } }, [customer?.uid, panel]);
  const begin = () => { onChange(current => startShift(current)); };
  return <>
    <SceneStage image="bank-scene.png" label="Şube 17 gişesi">
      <Hotspot id="bank-exit" type="Door" target="street" label="Banka çıkış kapısı" tooltip={game.phase === 'working' ? 'Kapı · mesai 17.00’de biter' : 'Meydana çık'} box={[72.2, 12.5, 9.2, 41]} game={game} phases={['morning', 'evening']} onActivate={() => onNavigate('street')} />
      <Hotspot id="bank-chair" type="WorkObject" label="Gişe masasına otur ve vardiyayı başlat" box={[38, 43, 25, 22]} game={game} visible={game.phase === 'morning'} onActivate={begin} shape="polygon(14% 0,85% 0,85% 65%,100% 83%,100% 100%,0 100%,0 82%,14% 63%)" />
      {customer && <Hotspot key={customer.uid} id="bank-customer" type="NPC" target={customer.uid} label={`${customer.name} ile görüş`} box={[40.5, 23.5, 21, 41.6]} game={game} onActivate={() => setPanel('file')} className="bank-scene-customer">
        <span className="bank-scene-sprite" style={{ '--customer-column': customerSpriteIndex(customer) }}><img src="./assets/customers-scene-atlas.png" alt="" draggable="false" /></span>
      </Hotspot>}
      <Hotspot id="bank-rulebook" type="Document" label="Genelge defterini incele" box={[20.5, 70.4, 21.4, 18]} game={game} onActivate={() => setPanel('rules')} shape="polygon(44% 0,100% 10%,77% 100%,0 79%,0 56%)" />
      <Hotspot id="bank-folder" type="Document" label={game.phase === 'morning' ? 'Mesai dosyası' : customer ? `${customer.name} başvuru dosyası` : 'Gişe sıra defteri'} box={[43, 71.4, 25.2, 19]} game={game} onActivate={() => setPanel(game.phase === 'morning' ? 'shift' : 'file')} shape="polygon(28% 0,96% 13%,100% 28%,86% 100%,0 70%,0 60%)" />
      <Hotspot id="bank-phone" type="Phone" label="Masadaki telefon" box={[85.5, 56.2, 14.5, 23.5]} game={game} onActivate={() => setPanel('phone')} shape="polygon(4% 60%,15% 47%,8% 22%,26% 5%,80% 0,100% 22%,100% 100%,0 88%)" />
      <p className="scene-place-note">{game.phase === 'morning' ? 'Gişen seni bekliyor. Mesaiye başlamak için masaya otur.' : customer ? `${customer.name} gişede bekliyor.` : game.bank.index >= game.bank.queue.length ? 'Bugünün sırası tamamlandı. Gişe 17.00’de kapanır.' : 'Sıradaki müşteri gişeye geliyor…'}</p>
    </SceneStage>
    {panel && <SceneDialog title={panel === 'rules' ? 'Yürürlükteki genelge' : panel === 'phone' ? 'Şube telefonu' : panel === 'shift' ? 'Mesai başlangıcı' : 'Gişe · belge ve görüşme'} size={panel === 'file' || panel === 'shift' ? 'wide' : 'normal'} onClose={() => setPanel(null)}>
      {panel === 'rules' ? renderRules() : panel === 'phone' ? <p className="scene-quiet-note">Hat sessiz. Şubeden yeni bir arama yok.</p> : renderBank()}
    </SceneDialog>}
  </>;
}

// Bu hedefler yalnız mevcut işlem panellerini açar; alışveriş ve kart kuralları motorun kendisinde kalır.
export const SHOP_SCENES = {
  bar: { image: 'bar-scene.png', name: 'Kızıl Fener', npc: 'Barmenle konuş', npcBox: [49, 26, 14, 35], object: 'Masaya otur', objectBox: [24, 67, 32, 21], door: [5, 20, 14, 56] },
  pharmacy: { image: 'pharmacy-scene.png', name: 'Nöbetçi eczane', npc: 'Eczacıyla konuş', npcBox: [47, 27, 16, 32], object: 'İlaçları incele', objectBox: [67, 60, 15, 18], door: [5, 20, 14, 56] },
  market: { image: 'market-scene.png', name: 'Mahalle büfesi', npc: 'Büfeciyle konuş', npcBox: [48, 26, 16, 32], object: 'Erzak paketini incele', objectBox: [23, 62, 19, 23], door: [5, 20, 14, 56] },
  casino: { image: 'casino-scene.png', name: 'Altın Talih', npc: 'Krupiyeyle konuş', npcBox: [43, 23, 16, 34], object: 'Blackjack masasına otur', objectBox: [24, 57, 58, 31], door: [5, 20, 14, 56] },
};

export function ShopScene({ game, onNavigate, location, renderShop, renderCasino }) {
  const [panel, setPanel] = useState(false);
  const place = SHOP_SCENES[location];
  return <>
    <SceneStage image={place.image} label={place.name}>
      <Hotspot id={`${location}-exit`} type="Door" target="street" label={`${place.name} çıkış kapısı`} box={place.door} game={game} onActivate={() => onNavigate('street')} />
      <Hotspot id={`${location}-npc`} type="NPC" label={place.npc} box={place.npcBox} game={game} onActivate={() => setPanel(true)} shape="polygon(28% 0,73% 0,88% 22%,76% 39%,100% 55%,98% 100%,0 100%,0 57%,24% 39%,13% 22%)" />
      <Hotspot id={`${location}-object`} type={location === 'casino' ? 'WorkObject' : 'Item'} label={place.object} box={place.objectBox} game={game} onActivate={() => setPanel(true)} />
      <p className="scene-place-note">{location === 'bar' && game.phase !== 'evening' ? 'Masalar akşam servisini bekliyor.' : location === 'casino' && game.phase !== 'evening' ? 'Kartlar mesai sonrasında dağıtılır.' : 'Dışarıdaki şehrin sesi kapının ardında kaldı.'}</p>
    </SceneStage>
    {panel && <SceneDialog title={place.name} size={location === 'casino' ? 'wide' : 'normal'} onClose={() => setPanel(false)}>{location === 'casino' ? renderCasino() : renderShop()}</SceneDialog>}
  </>;
}
