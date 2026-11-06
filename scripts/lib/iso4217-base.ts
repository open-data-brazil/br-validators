/** ISO 4217 active currency codes — embedded baseline for @br-validators/core/moedas. */

export interface Iso4217Seed {
  codigo: string;
  nome: string;
  simbolo: string | null;
}

const ISO4217_CSV = `AED|Dirham dos Emirados Árabes Unidos|د.إ
AFN|Afegane afegão|؋
ALL|Lek albanês|L
AMD|Dram arménio|֏
ANG|Florim das Antilhas Neerlandesas|ƒ
AOA|Kwanza angolano|Kz
ARS|Peso argentino|$
AUD|Dólar australiano|A$
AWG|Florim arubano|ƒ
AZN|Manat azeri|₼
BAM|Marco convertível da Bósnia-Herzegovina|KM
BBD|Dólar barbadense|$
BDT|Taka bengali|৳
BGN|Lev búlgaro|лв
BHD|Dinar bareinita|.د.ب
BIF|Franco burundiano|Fr
BMD|Dólar bermudense|$
BND|Dólar bruneano|$
BOB|Boliviano|Bs.
BRL|Real brasileiro|R$
BSD|Dólar bahamense|$
BTN|Ngultrum butanês|Nu.
BWP|Pula botsuanesa|P
BYN|Rublo bielorrusso|Br
BZD|Dólar belizense|$
CAD|Dólar canadense|C$
CDF|Franco congolês|Fr
CHF|Franco suíço|Fr
CLP|Peso chileno|$
CNY|Yuan renminbi chinês|¥
COP|Peso colombiano|$
CRC|Colón costa-riquenho|₡
CUP|Peso cubano|$
CVE|Escudo cabo-verdiano|$
CZK|Coroa checa|Kč
DJF|Franco djibutiano|Fr
DKK|Coroa dinamarquesa|kr
DOP|Peso dominicano|$
DZD|Dinar argelino|د.ج
EGP|Libra egípcia|E£
ERN|Nakfa eritreia|Nfk
ETB|Birr etíope|Br
EUR|Euro|€
FJD|Dólar fijiano|$
FKP|Libra das Ilhas Falkland|£
GBP|Libra esterlina|£
GEL|Lari georgiano|₾
GHS|Cedi ganês|₵
GIP|Libra de Gibraltar|£
GMD|Dalasi gambiano|D
GNF|Franco guineense|Fr
GTQ|Quetzal guatemalteco|Q
GYD|Dólar guianense|$
HKD|Dólar de Hong Kong|HK$
HNL|Lempira hondurenha|L
HTG|Gourde haitiano|G
HUF|Forint húngaro|Ft
IDR|Rupia indonésia|Rp
ILS|Novo shekel israelense|₪
INR|Rúpia indiana|₹
IQD|Dinar iraquiano|ع.د
IRR|Rial iraniano|﷼
ISK|Coroa islandesa|kr
JMD|Dólar jamaicano|$
JOD|Dinar jordano|د.ا
JPY|Iene japonês|¥
KES|Xelim queniano|Sh
KGS|Som quirguiz|с
KHR|Riel cambojano|៛
KMF|Franco comorense|Fr
KRW|Won sul-coreano|₩
KWD|Dinar kuwaitiano|د.ك
KYD|Dólar das Ilhas Cayman|$
KZT|Tenge cazaque|₸
LAK|Kip laosiano|₭
LBP|Libra libanesa|ل.ل
LKR|Rúpia cingalesa|Rs
LRD|Dólar liberiano|$
LSL|Loti lesotiano|L
LYD|Dinar líbio|ل.د
MAD|Dirham marroquino|د.م.
MDL|Leu moldavo|L
MGA|Ariary malgaxe|Ar
MKD|Denar macedónio|ден
MMK|Kyat birmanês|K
MNT|Tugrik mongol|₮
MOP|Pataca macaense|P
MRU|Ouguiya mauritana|UM
MUR|Rúpia mauriciana|₨
MVR|Rufiyaa maldiva|.ރ
MWK|Kwacha malauiana|MK
MXN|Peso mexicano|$
MYR|Ringgit malaio|RM
MZN|Metical moçambicano|MT
NAD|Dólar namibiano|$
NGN|Naira nigeriana|₦
NIO|Córdoba nicaraguense|C$
NOK|Coroa norueguesa|kr
NPR|Rúpia nepalesa|₨
NZD|Dólar neozelandês|NZ$
OMR|Rial omanense|ر.ع.
PAB|Balboa panamenho|B/.
PEN|Sol peruano|S/
PGK|Kina papuásia|K
PHP|Peso filipino|₱
PKR|Rúpia paquistanesa|₨
PLN|Zloty polaco|zł
PYG|Guarani paraguaio|₲
QAR|Rial catariano|ر.ق
RON|Leu romeno|lei
RSD|Dinar sérvio|дин.
RUB|Rublo russo|₽
RWF|Franco ruandês|Fr
SAR|Rial saudita|ر.س
SBD|Dólar das Ilhas Salomão|$
SCR|Rúpia seichelense|₨
SDG|Libra sudanesa|ج.س.
SEK|Coroa sueca|kr
SGD|Dólar singapurense|S$
SHP|Libra de Santa Helena|£
SLE|Leone de Serra Leoa|Le
SOS|Xelim somali|Sh
SRD|Dólar surinamês|$
SSP|Libra sul-sudanesa|£
STN|Dobra de São Tomé e Príncipe|Db
SVC|Colón salvadorenho|₡
SYP|Libra síria|£
SZL|Lilangeni suazi|L
THB|Baht tailandês|฿
TJS|Somoni tajique|ЅМ
TMT|Manat turcomeno|m
TND|Dinar tunisino|د.ت
TOP|Paʻanga tonganesa|T$
TRY|Lira turca|₺
TTD|Dólar de Trinidad e Tobago|$
TWD|Novo dólar taiwanês|NT$
TZS|Xelim tanzaniano|Sh
UAH|Hryvnia ucraniana|₴
UGX|Xelim ugandense|Sh
USD|Dólar dos Estados Unidos|US$
UYU|Peso uruguayo|$U
UZS|Som uzbeque|so'm
VES|Bolívar soberano|Bs.S
VND|Dong vietnamita|₫
VUV|Vatu vanuatuense|Vt
WST|Tala samoano|T
XAF|Franco CFA BEAC|Fr
XCD|Dólar do Caribe Oriental|$
XOF|Franco CFA BCEAO|Fr
XPF|Franco CFP|Fr
YER|Rial iemenita|﷼
ZAR|Rand sul-africano|R
ZMW|Kwacha zambiano|ZK
ZWL|Dólar zimbabuense|Z$`;

function parseIso4217Csv(csv: string): Iso4217Seed[] {
  return csv
    .trim()
    .split('\n')
    .map((line) => {
      const parts = line.split('|');
      const codigo = parts[0].trim().toUpperCase();
      const nome = parts[1].trim();
      const simboloRaw = parts[2]?.trim() ?? '';
      return {
        codigo,
        nome,
        simbolo: simboloRaw.length > 0 ? simboloRaw : null,
      };
    })
    .filter((entry) => entry.codigo.length === 3 && entry.nome.length > 0);
}

export const ISO4217_BASE: readonly Iso4217Seed[] = parseIso4217Csv(ISO4217_CSV);

export const ISO4217_MIN_MOEDAS = 150;
export const ISO4217_MAX_MOEDAS = 200;
