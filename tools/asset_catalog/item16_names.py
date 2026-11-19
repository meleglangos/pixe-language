"""Az Items16 ikonok pontos magyar nevei (ikononként, kézzel, a képek alapján; 2026-11).
A katalógus oldal (catalog.html) ezeket mutatja és ezekben keres; a sorszám-tartomány leírása marad a kategória.
Rejtett tartományok (rules.py -> HIDDEN_ITEM16) nincsenek benne.
"""
NAMES = {}


def add(start, names):
    for i, n in enumerate(names.split(';')):
        n = n.strip()
        if n:
            NAMES[start + i] = n


add(1, 'bronzkard; vaskard; tűzkard; acélkard; aranykard; kristálykard; rézkard; sötét kard; jégkard hullámos pengével; indás smaragdkard;'
       'bíbor sötét kard; díszes aranykard; díszes tűzkard; zöld kristálykard; árnyékkard; smaragd díszkard; lángkard; szélpenge; jégpenge; rézpenge;'
       'bronzcsákány; vascsákány; rubincsákány; íves vascsákány; aranycsákány; jégcsákány; fekete csákány; sötét csákány; vörös díszcsákány; indás csákány;'
       'bíbor csákány; arany csillagcsákány; díszes bronzcsákány; tűzcsákány; vörös-fekete csákány; virágos csákány; lángoló csákány; kristálycsákány; rézcsákány; kis bronzfejsze;'
       'kis vasfejsze; tűzfejsze; vaskalapács; aranyfejsze; kristályfejsze; rézfejsze; vasfejsze; díszes arany csatabárd; indás csatabárd; bíbor csatabárd;'
       'nagy aranyfejsze; aranybárd; zöld kristálybárd; kék-vörös csatabárd; virágos csatabárd; tűzbárd; jégfejsze; rézbárd; rézbuzogány; vaskalapács;'
       'tűzkalapács; nagy vaskalapács; aranykalapács; jégkalapács; sötét kalapács; fakalapács; bronzkalapács; indás kalapács; bíbor kalapács; díszes aranykalapács;'
       'acél pöröly; vasbuzogány; tüskés aranybuzogány; jégbuzogány; csontbuzogány; falapát; vaslapát; vörös lapát; vaslapát; aranylapát')
add(81, 'kristálylapát; sötét lapát; vasásó; aranyásó; indás ásó; bíbor lapát; díszes aranylapát; kerek ezüstlapát; rubinos kristálylapát; tűzlapát;'
        'jégásó; széles rézlapát; bronzkapa; vaskapa; vörös kapa; vaskapa; aranykapa; jégkapa; rézkapa; sötét kapa;'
        'tűzkapa; indás kasza; bíbor kasza; díszes aranykapa; jégkapa; rézcsákány; vörös sarló; vassarló; aranysarló; jégsarló;'
        'sötét sarló; rézsarló; bronzsarló; piros-fehér sarló; bronzlándzsa; vaslándzsa; vörös lándzsa; sötét lándzsa; aranylándzsa; jéglándzsa;'
        'rézlándzsa; sötét lándzsa; díszes bronzlándzsa; bíbor lándzsa; díszes aranylándzsa; tűzlándzsa; virágos lándzsa; lángoló lándzsa; jéglándzsa; széles rézlándzsa;'
        'gömbös fabot; kék gömbös pálca; tűzgömbös bot; tüskés vasbuzogány; arany napbot; jégcsillag-buzogány; sötét tüskés buzogány; sötét buzogány; bíbor csillagbuzogány; arany csillagbuzogány;'
        'ezüst gömbös pálca; díszes tűzpálca; arany csillagpálca; napkorongos bot; jégkristály-buzogány; koponyás bot; hosszú fa íj; rövid fa íj; fa számszeríj; számszeríj;'
        'vas számszeríj; jég számszeríj; vashegyű nyílvessző; tűznyílvessző; vas nyílvessző; bronz nyílvessző; jégnyílvessző; zöld nyílvessző; bíbor nyílvessző; arany nyílvessző')
add(161, 'bíbor nyílvessző; zöld tollú nyílvessző; tűzhegyű nyílvessző; jégnyílvessző; réz nyílvessző; vasérem; vörös érem; ezüstérem; aranyérem; gyémántérem;'
         'bronz vasvilla; tűzszigony; vas vasvilla; aranyszigony; jégszigony; réz vasvilla; kristályszigony; indás szigony; bíbor szigony; díszes aranyszigony;'
         'vas vasvilla; jég-tűz szigony; vörös szigony; jégszigony; rézszigony; fa horgászbot; vörös horgászbot; vas horgászbot; arany horgászbot; jég horgászbot;'
         'indás horgászbot; vörös hegyű lándzsa; bronzlándzsa; fenyőág-lándzsa; fáklya; ívelt vaspenge; fapajzs; vörös kerek pajzs; vas címerpajzs; zöld díszpajzs;'
         'bőrsapka; sodronycsuklya; vörös sisak; vödörsisak; aranykorona; vas félsisak; tollas sapka; koponyasisak; bőrsisak; virágkoszorú;'
         'szarvas sisak; barna kalap; kötött sapka; tollas fejdísz; narancs sapka; aranysisak; szivárványos sapka; koponyamaszk; fekete sisak; vörös-arany páncél;'
         'bőrmellény; fehér ing; vörös-arany páncél; láncing; aranypáncél; jégpáncél; lemezpáncél; indás mellény; bőrpáncél; smaragdpáncél;'
         'díszes tunika; bőrkabát; sötét kabát; kristálypáncél; vörös köpeny; narancs ruha; színes díszpáncél; ezüst mellvért; fekete páncél; lángpáncél')
add(241, 'bőrnadrág; vas lábvért; barna szoknya; vas lábvért; arany lábvért; jég lábvért; vasnadrág; indás nadrág; bőr lábvért; zöld lábvért;'
         'barna rövidnadrág; kék farmernadrág; szürke szoknya; kék lábvért; kék nadrág; barna nadrág; lángnadrág; fehér lábvért; fekete nadrág; vörös díszes nadrág;'
         'bőrcsizma; barna csizma; vörös csizma; vascsizma; aranycsizma; jégcsizma; barna bakancs; indás csizma; rézcsizma; zöld csizma;'
         'sötét vascsizma; türkiz csizma; narancs cipő; sötétzöld csizma; vörös kesztyű; vascsizma; fekete csizma; vörös díszcsizma; zöld gázmaszk; hóember fej;'
         'mikulássapka; ezüst láncing; hóember sállal; mikuláskabát; fehér nadrág; fehér pamacs; piros nadrág; zöld csizma; piros szőrmés csizma; bőrkesztyű;'
         'bőrkesztyű; bőr ujjatlan kesztyű; bőr karvédő; bőrkesztyű; bőrcipő; vörös lovagsisak; vödörsisak; lovagsisak; fazéksisak; ezüstsisak;'
         'keresztes lovagsisak; rókamaszk; vörös démonmaszk; tigrismaszk; bohócmaszk; űrhajós sisak; szakácssapka; barna cilinder; virágos fejdísz; babérkoszorú;'
         'vörös csuklya; rongyos sapka; aranyozott sisak; farkasmaszk; barna paróka; fekete cilinder; fehér kapucni; fehér köpeny; díszes mellény; zöld kapucnis köpeny')
add(321, 'fehér ing; piros alma; romlott alma; sajt; sült csirkecomb csontváz; répa; barna gomba; piros pöttyös gomba; krumpli; cseresznye;'
         'kenyér; bagett; sült hús; csirkecomb; paradicsom; görögdinnye; dinnyeszelet; tojás; sült garnélarák; paprika;'
         'kivi; padlizsán; uborka; banán; kókuszdió; hagyma; fánk; fagylalttölcsér; pizzaszelet; pitesszelet;'
         'csokis tortaszelet; tejszínes tortaszelet; epres tortaszelet; csokoládé; cupcake; muffin; palacsinta; keksz; kolbász; zöld kígyóuborka;'
         'fokhagyma; befőtt; zöldbab; kukorica; áfonya; pirítós; sült hal; csirkecomb; saláta; tejesdoboz;'
         'sajtkarika; tea; ananász; méhsejt; őszibarack; croissant; chili paprika; mangó; rókagomba; zöld levél;'
         'csiperkegomba; cseresznye; citrom; onigiri; lazac szelet; szendvics; sült krumpli; káposzta; kék gomba; fehérrépa;'
         'cékla; karfiol; tükörtojás; retek; csokoládétábla; csokis szendvics; jégkrém; csokis jégkrém; tölcséres fagyi; vaníliafagyi')
add(401, 'epres fagyitölcsér; hamburger; puding; csokis ekler; sárga torta; steak; szendvics; piros lekváros üveg; zöld lekváros üveg; fahéjas csiga;'
         'avokádó; rózsaszín gomba; szürke gomba; lekváros pirítós; ribizli; tök; szőlő; paradicsom; brokkoli; barack;'
         'sushi tekercs; piros bájital; rakott tészta; vörösbor pohár; croissant; csokitorta-szelet; áfonyás pite; pizzaszelet; csokis süti; pálcikás sütemény;'
         'eper; hal; nyers hús; lazacszelet; halszelet; sült fürj; szalonna; sült borda; sonka; nyers marhahús;'
         'nyers csirke; nyers halszelet; nyers szárnyas; bordás hús; hússzelet; virsli; grillezett csirkecomb; sonkacomb; sült csirke; sült hús;'
         'sült garnéla; sült csirke; grillezett borda; sült szelet; újhagyma; csirkecomb csonttal; halcsontváz; pattogatott kukorica; csokis keksz; nyárson sült hús;'
         'barna gombák; ezüst gomba; sötét gomba; sötét levelek; vegyes gombák; taco; halszálka; ezüst hal; gombacsokor; zöld gomba;'
         'vörös gomba; barna kalapos gomba; lila hagyma; póréhagyma; rizses tál; leveses tál; cipó; szalámi; derelye; salátás tál')
add(481, 'káposzta; vöröskáposzta; karfiol; tejszínes desszert; pitesszelet; kerek kenyér; kávé tejszínhabbal; rozmaring; barna körte; pizza;'
         'garnélarák; lisztes zsák; kerek cipó; torta; koktél; sült hal; leveses tál; pite; vörösboros üveg; pezsgősüveg;'
         'fűszernövény; garnéla; sült pirog; narancsgerezd; fésűkagyló; karamellás alma; taco; burrito; kifli; zsemle;'
         'fűszeres zsák; színes süti; üres tál; palacsinta; kerámiatál; pillecukor nyárson; fakanál; merőkanál; üveggolyó; perec;'
         'áfonyás pite; zöldségnyárs; epres pite; zöld pite; gofri; szendvics; főtt tojás; teafilter; cukorka; bőségszaru;'
         'rózsakvarc; ametiszt; rózsaszín kristálytű; bíbor kristályszilánk; kerek rubin; rubin; aranytömb; topáz; szivárványkő; smaragd;'
         'citrin; zöld kristályszilánk; zöld kristály; akvamarin; jégkristály-szilánkok; ezüstkristály; kék kristálytű; fekete gyöngy; obszidián; fekete kristály;'
         'gyémánt; ezüstérc; ónix; szivárványos kristálykocka; szivárványos drágakő; kristálygömb; jégkristály; kristálycsillag; tűzkő; jégkristályok')
add(561, 'sötét rubin; vasrúd; vörös-fekete rúd; rézrúd; izzó rúd; ezüstrúd; aranyrúd; opálrúd; jáderúd; mithrilrúd;'
         'kékacél rúd; rózsaarany rúd; sötétkék rúd; szénérc; vörös érc; rézérc; színes érc; vörös-fehér érc; aranyérc; színes kristályérc;'
         'zöld érc; ezüstös vasérc; kék érc; rubinérc; türkiz érc; fekete kő; vulkáni kő; réteges agyagkő; színes kőzet; vöröses kőzet;'
         'aranyrög; szivárványos kristály; moha; jégkocka; kék kő; spirálkövület; lánc; gyöngy; toll; bomba;'
         'hópehely; jégtömb; rózsaszín ajándék; zöld-piros ajándék; sárga-kék ajándék; lila-sárga ajándék; kék ajándék; rózsaszín-fehér ajándék; zöld-sárga ajándék; ajándékkupac;'
         'aranycsillag; arany karácsonyi gömb; aranycsengő; csengők masnival; cukorpálca; karácsonyi puding; magyal; mikulássapka; díszes süti; mézeskalács-figura;'
         'fenyőtoboz; adventi koszorú; rózsaszín kesztyű; piros sapka; barna könyv; régi könyv; piros könyv; könyvkupac; tekercs; pecsétes tekercs;'
         'olló; szivárványos legyező; sötét ecset; ecset; piros radír; kék-piros radír; ceruza; töltőtoll; tustoll; térkép')
add(641, 'levél; szerelmes levél; vörös medál; régi tekercs; gemkapocs; papírlap; tekercs masnival; bíbor varázskönyv; pergamen; akasztóhorog;'
         'tintatartó; kék könyv; zöld könyv; kék könyvkupac; írókészlet; piros gömbös varázspálca; nagyító; vörös kristály; jegyzetek; térkép;'
         'bőrdarab; kincses térkép; csillagtérkép; arany tekercs; varázspor; kötött zsák; üzenet palackban; bőrzacskó; fehér vászon; állatbőr;'
         'tégla; bilincs; nyaklánc; hátizsák; zöld hátizsák; bőrzsák; létra; méhkas; zsebóra; agyagkorsó;'
         'bőrtáska; bőrönd; ezüst pénzeszsák; cigaretta; szivar; kötél; sonka; szív; lánc; patkó;'
         'aranykulcs; díszes aranykulcs; ezüstkulcs; vörös kulcs; csákány; fehér nyílhegy; gyertya; díszdoboz; piros csákány; vasfogó;'
         'aranyjogar; fadarab; pipa; színes medál; rongybaba; vörös kalapács; véső; zöld toll; piros kalapács; kék fejsze;'
         'mágnes; varrótű; vörös gombos pálca; szürke kincsesláda; piros láda; lámpás; fadoboz; faláda; kialudt fáklya; égő fáklya')
add(721, 'tábortűz; olajlámpa; tűzijáték-rakéta; láncos horog; barna doboz; kincsesláda; kis fáklya; jelzőfáklya; üvegedény; zöld fénypálca;'
         'vasgolyó lánccal; bilincs; láncszemek; csúzli; kis golyók; láncháló; piros lufi; ezüstlánc; láncszem; díszes aranykulcs;'
         'indás kulcs; vaskulcs; rézkulcs; zöld szappan; fadoboz; piros toll; üllő; kürt; piros kesztyű; piros zászló;'
         'faágak; filmtekercs; ágyú; megafon; lámpa; bőröv; piros nyelű kés; kötőtű; csipesz; rúzs;'
         'felhő; arany mellvért; zöld mellény; mágnes; ezüstkosár; iránytű; jégbot; távcső; fogaskerék; lepkeháló;'
         'jégkristály-csokor; fehér zászló; háromlábú állvány; lila parfüm; türkiz legyező; lila erszény; virágcsokor; fekete sakkbábuk; lánc; fehér toll;'
         'sült húsdarab; mellszobor; kosár; nyílköteg; fehér sakkbábu; fehér sakkbábu; fehér sakkbábu (ló); fehér sakkbábu; fehér sakkbábu; fehér sakkbábu (gyalog);'
         'dobókocka; dominó; kártyalap; kártyalapok; kanál; konyhai bárd; villa; sajtreszelő; kés; konyhakés')
add(801, 'kék gömbös pálca; kék tőr; kis kés; tányér; serpenyő; fatál; üst; fazék; mozsár; bögre;'
         'csésze; fekete tőr; vörös-fekete tőr; íves jégtőr; vörös tőr; vörös medál lánccal; díszes tőr; arany ankh; zöld markolatú tőr; korall;'
         'fapálca; színes tollak; fekete gyöngysor; fabot; kőkereszt; zöld kereszt; keresztezett tőrök; rózsafüzér; smaragdtőr; bíbor tőr;'
         'narancs nyaklánc; álomfogó; arany tiara; arany skarabeusz; virágos íj; lant; sötét pálca; dob; mandolin; hegedű;'
         'fuvola; elektromos gitár; furulya; arany kürt; mikrofon; magnó; bakelitlemez; CD-lemez; kazetta; keresztezett dobverők;'
         'keresztezett fabotok; zseblámpa; trombita; hárfa; líra; okarina; triangulum; xilofon; karmesteri pálca; ukulele;'
         'marakások; tamburin; aranycintányér; pánsíp; hangvilla; képkeret; amulett türkiz kővel; sötét medál; vörös nyaklánc; gyöngysor vörös kővel;'
         'aranylánc kővel; aranygyűrű; drágaköves gyűrű; korona; szürke köpeny; vörös köpeny; fekete köpeny; boszorkánykalap; varázslósüveg; kristálygömb')
add(881, 'jégpálca; vörös gömbös pálca; indás pálca rózsaszín kővel; díszes varázspálca; bíbor pálca; aranypálca; vékony fapálca; tollas varázsbot; pásztorbot; ezüst kötél;'
         'zöld nadrág; aranygyűrű; lila boszorkánykalap; drágaköves ezüstgyűrű; indás pálca; gömbös fabot; fapálca; seprű; boszorkányseprű; koponyás pálca;'
         'ezüst bájital; csillogó sárga bájital; lila bájital; rózsaszín ruha; rózsás pálca; aranycsillagos pálca; aranyrúd-pálca; dinamitköteg; vörös henger; vörös rózsa;'
         'kék henger; kék-sárga kristálykő; elsősegélydoboz; fehér tabletta; injekciós tű; szivárványos tömb; fűkocka; vas csatabárd; zöld palack; kék háromágú tőr;'
         'nunchaku; fenőkő; ívelt kés; dobótőr; dobócsillag; horog; bőrtekercs; kézi számszeríj')
add(988, 'ág levéllel; rönkdarab; nyírfarönk; faanyag; deszka; deszkák; nagy levél; levelek; levélcsokor; páfránylevél;'
         'sötét levelek; bogyós ág; makk; gyapot; bambusz; kis fa; kaktusz; virágzó kaktusz; virágcsokor; virágos ág;'
         'bokor; zöld lomb; gally; indák; deszka; lóhere; nagy makk; barna gombák; inda; gyökér; rózsaszín virág; madárfészek')
add(1020, 'zöld bokor; magvak; barack színű virág; őszibarack; hóvirág; fehér liliom; fehér virág; százszorszép; sárga virág; napraforgó;'
          'piros tulipán; piros rózsa; málna; rózsaszín virágok; kék virág; fehér-piros virág; barna levél; levendula; piros virágbokor; barackvirág;'
          'fehér kála; narancs virágcsokor; sárga vadvirág; pitypang; kis ezüsthal; aranyhal (vörös); ezüst sügér; kék hal; vörös-fekete hal; fekete-fehér hal;'
          'ezüsthal; narancs hal; csuka; zöld hal; zöld piranha; tintahal; angolna; kék angolna; sötét angolna; hal csontváz;'
          'rája; delfin; sötét ragadozóhal; trópusi hal; szürke hal; kék hal; vörös hal; rák (barna); szemes gömbhal; szivárványos hal;'
          'aranyhal; zöld csíkos hal; delfin; rózsaszín hal; arany ponty; homár; halfej; kagylós csiga; kék hal; fekete-fehér hal;'
          'bohóchal; sötét mélytengeri hal; tigrishal; korall (narancs); kardhal; ezüst cápa; barna rák; ezüst kagyló; osztriga; kék kagyló;'
          'fésűkagyló; polip; tintahal; tengeri csillag; rózsaszín garnéla; csigaház; fehér korall; ezüst korall; rózsaszín korall; narancs korall')
add(1100, 'csikóhal; narancs rák; vörös homár; csalis horog; horog; horog; nagy horog; horgászcsali; piros úszós horog; csali horgon;'
          'piros-fehér úszó; vashorgony; horgony; kötélkarika; mentőöv; evező; búvársisak; uszony; búvármaszk; búvárpalack;'
          'aranyrög; aranyrögök; zöld kőzet; vörös kristályos kő; színes ásvány; zöld ásvány; szén; kőtömbök; agyaggombóc; jégrúd;'
          'türkiz ásvány; szürke kőzet; vörös kőzet; narancs kavicsok; láva-kristály; tűzkő; fekete kőzet; szürke kőszilánk; jégkő; lávakő;'
          'kőfej; kőkorong (spirál); vörös erezetű kő; jégkristály; szem alakú kő; vörös kristálytoll; üres vödör; vizes vödör; mézes vödör; nagy üres vödör;'
          'láva vödör; mézes vödör; zöld vödör; zöld vödör; rózsaszín vödör; favödör; vaskarika; narancs korong; ezüstérme; aranyérme;'
          'pénzköteg; bankjegyköteg; zöld rúd; aranyérme-halom; csont; nagy fog; zöld béka; koponya; narancs koponya; zöld szemgolyó;'
          'zöld szemgolyó; barna szemgolyó; vörös szemgolyó; véres szemgolyó; gépszem; zöld pikkely; barna toll; zöld toll; piros toll; szív (szerv)')
add(1180, 'agy; nyelv; szarv; csáp; gyomor (szerv); fog; tűzkarom; fehér karom; narancs karom; vörös karom;'
          'kék nyálka; zöld nyálka; sárga nyálka; trágya; szem (szerv); fekete gyöngyszem; belsőség; narancs tüske; tüskés karom; vas szárny;'
          'denevérszárny; csontváz-kéz; száj; tüdő; agyar; görbe agyar; máj; pók; zöld levél (pikkely); farkasfej;'
          'zöld pikkely; bordacsont; medvemancs; fadarab (bot); zöld kéz; nyers hús; halfarok; zöld kígyóbőr; fekete gyöngy; zöld szem;'
          'cápafog; ezüst szárny; vörös szárny; garnélarák; zombifej; teknős; teknőspáncél; csontváz; barna toll; légy;'
          'tűztoll; szemgolyó; véres szemgolyó; csirkehús; méh; darázs; tüskés pikkely; csontpálca; lángkarom; tüzes karom;'
          'csontkéz; holló; zöld kígyó; jégtoll; pókháló')
