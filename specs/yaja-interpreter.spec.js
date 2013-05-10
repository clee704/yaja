describe('yaja.Interpreter', function () {

  var interpreter,
      output;

  beforeEach(function () {
    interpreter = new yaja.Interpreter();
    interpreter.setOut({print: function (str) { output += str; }});
    output = '';
  });

  describe('to be compatible with jsaheui', function () {
    it('should stop at the edge when crossing border to the opposite side', function () {
      interpreter.setProgram('별희멍');
      interpreter.run();
      expect(output).toEqual('5');
    });

    it('should handle row lengths separately', function () {
      interpreter.setProgram('별희멍\nㅇㅇㅇㅇ');
      interpreter.run();
      expect(output).toEqual('5');
    });

    it('should distinguish absence of character and invalid characters', function () {
      interpreter.setProgram('별희멍ㅇ\nㅇㅇㅇㅇ');
      interpreter.run();
      expect(output).toEqual('');
    });
  });

  describe('run method', function () {
    it('should continue from the previous state', function () {
      // Code from http://puzzlet.org/personal/wiki.php/%EC%95%84%ED%9D%AC~%ED%94%BC%EB%B3%B4%EB%82%98%EC%B9%98%EC%88%98%EC%97%B4
      interpreter.setProgram('분받분쌍쌍상빠쌍다쑹\n발또타보라뫃뻐서멍뻐');
      interpreter.run(50);
      expect(output).toEqual('1\n1\n2\n3\n');
      interpreter.run(50);
      expect(output).toEqual('1\n1\n2\n3\n5\n8\n13\n21\n34\n');
      interpreter.run(55);
      expect(output).toEqual('1\n1\n2\n3\n5\n8\n13\n21\n34\n55\n89\n144\n233\n377\n610');
    });
  });

  describe('among various programs', function () {
    it('should run Hello, world! program (7x7) correctly', function () {
      interpreter.setProgram('밤발따발따빠붇\n붒뻐더벓뻐퍼너\n다빠밬타빠밣두\n붐더벍범떠벓범\n따빠밬따밬밝뚜\n붉뻐뻐터벜뻐터\n타밣밞땨이멓희');
      interpreter.run();
      expect(output).toEqual('Hello, world!');
    });

    it('should run Hello, world! program (8x8) correctly', function () {
      // Code from http://uncyclopedia.kr/wiki/%EC%95%84%ED%9D%AC
      interpreter.setProgram('밤밣따빠밣밟따뿌\n빠맣파빨받밤뚜뭏\n돋밬탕빠맣붏두붇\n볻뫃박발뚷투뭏붖\n뫃도뫃희멓뭏뭏붘\n뫃봌토범더벌뿌뚜\n뽑뽀멓멓더벓뻐뚠\n뽀덩벐멓뻐덕더벅');
      interpreter.run();
      expect(output).toEqual('Hello, world!\n');
    });

    it('should run Hello, world! program (7x8) correctly', function () {
      // Code from http://uncyclopedia.kr/wiki/%EC%95%84%ED%9D%AC
      interpreter.setProgram('밣붍맣뱓몋두붖멓\n뭏따맣불뽀뿌다맣\n뭏누뻐쀀쀀쀀떠묳\n붖다뭏다쀀쀀뽀도\n뚜붇뱛몋도뼈타뭏\n붖나빠밠다맣볼뵳\n다맣맣희지민제작');
      interpreter.run();
      expect(output).toEqual('Hello, world!\n');
    });

    it('should run Hello, world! program (1x57) correctly', function () {
      // Code from http://uncyclopedia.kr/wiki/%EC%95%84%ED%9D%AC
      interpreter.setProgram('밣밡따맣발빠다빠빠빠따빠빠빠빠나다맣밣다빠빠빠맣맣받다빠빠빠빠맣받나빠밠다맣발타맣밣다맣맣밪다맣맣맣밪따밪다맣맣희');
      interpreter.run();
      expect(output).toEqual('Hello, world!\n');
    });

    it('should run FizzBuzz program correctly', function () {
      // Code from http://uncyclopedia.kr/wiki/%EC%95%84%ED%9D%AC
      interpreter.setProgram('불살밝빠따반따삼밟빠밤다따삽밥발밦따따반다야주서\n아쀼우멓멓뻐뻐섭멓뻐섣멓뻐우러벋루떠벌벋뻐석처해\n뜌요삭뱓여분여오어멓뻐섬손차쀼뽀처산아빠먛요숟유\n오땨볍어탸어다빠사아빠삭싸뱘아뱢우댜여야몋뫃빠뫃\n뿌요튜여뷸뗘요멓여몋여묳어루벌쀼야셤슐아뮿여뿌우\n숙반오산오또댜볅샫별벋살뽀챠우야명야뼈석요우어숩\n아볻빠쏘빠땨본밥뗘뾰요뼈여셥여몋맣요뼈멓오뾰요어');
      interpreter.run();
      expect(output).toEqual('1\n2\nfizz\n4\nbuzz\nfizz\n7\n8\nfizz\nbuzz\n11\nfizz\n13\n14\nfizzbuzz\n16\n17\nfizz\n19\nbuzz\nfizz\n22\n23\nfizz\nbuzz\n26\nfizz\n28\n29\nfizzbuzz\n31\n32\nfizz\n34\nbuzz\nfizz\n37\n38\nfizz\nbuzz\n41\nfizz\n43\n44\nfizzbuzz\n46\n47\nfizz\n49\nbuzz\nfizz\n52\n53\nfizz\nbuzz\n56\nfizz\n58\n59\nfizzbuzz\n61\n62\nfizz\n64\nbuzz\nfizz\n67\n68\nfizz\nbuzz\n71\nfizz\n73\n74\nfizzbuzz\n76\n77\nfizz\n79\nbuzz\nfizz\n82\n83\nfizz\nbuzz\n86\nfizz\n88\n89\nfizzbuzz\n91\n92\nfizz\n94\nbuzz\nfizz\n97\n98\nfizz\nbuzz\n');
    });

    it('should run 99 Bottles of Beer program correctly', function () {
      // Code from http://uncyclopedia.kr/wiki/%EC%95%84%ED%9D%AC
      interpreter.setProgram('산발발밥따따빠빠빠빠빠빠빠빠빠뿌\n쑱썴썳썲썱썰썯썮썭뻐뻐뻐뻐뻐뻐뻐\n쌆쌇쌈쌉쌊쌋쌌쌎반타삱발밦다다숞\n뚜벌벋섥더너벅벅설더벓섣더떠벆벆\n다삶박다삷밝반따다삸발반따다삹불\n숨더더벋떠범범섫더범섪터떠번더벖\n받타삽밞밪따반다타삿밪발따반다두\n쑼뻐떠범더벐범섳더벑섲더떠벋벍섰\n샄반다샅밣밨따수박지민제작붸에엙\n아아아아아아유붊다뚜샤먕뿌아아아아아\n뿌섢멓뻐섡빠몋발봆숙오뽀처삭뿌뚫맣숮\n빠맣맣삳뿌손야몋우바오ㅇㅇ숥차숤뽀뿌\n뿌서멓뻐맣셜뷁뽀섵모오ㅇㅇ빠뭏뻐솥뭏\n싺삮반반나타우쀼오속여ㅇㅇ어삱빠뫃숝\n숢멓뻐섡멓우차솕훍ㅇ요ㅇㅇ오멓뭏뻐뿌\n뿌빠맣순뽀섵어멓슓오ㅇ어ㅇㅇ뽀설솗멓\n맣솥먛뻐살빠빠맣뫃ㅇ오ㅇㅇㅇㅇ어지민\n뉴번번섞썪뻐석멓뻐맣숨오ㅇㅇㅇㅇㅇ어\n뺘섵맣삱빠맣삸빠뭏뽀뿌ㅇㅇㅇ맣ㅇ불오\n타초숦멓뻐섢멓뻐섵솛뭏ㅇ숙멓뽀ㅇ뿌초\n뿌섴빠맣살빠맣샅빠뫃삳빠뽜뫃솤ㅇ두회\n맣발반따맣삭마반수아숯어바타초ㅇ뭏툐\n숱멓뻐섡멓섭차붌뼈ㅇ뿌노번번머ㅇ수소\n빠맣삲빠뭏뚜떠반볎ㅇ맣샅빠맣아오뿌쏘\n뿌섵멓뻐섡맣삼빠뭏ㅇㅇㅇㅇㅇㅇㅇ숨도\n맣삵빠맣숞숛썫뻐섪오ㅇㅇㅇㅇㅇ어빠본\n뭏뻐섡멓뻐받다맣술맣술맣불맣숝오ㅇ어ㅇㅇㅇㅇㅇㅇㅇㅇ어\n삷빠맣살뿌뿌섵멓뻐뽀뿌뽀뿌또뿌맣숪토맣사마밡밡반다따오\n숨멓뻐섵멓맣삱빠맣솘맣솥밤또뭏뽀뿌노뽀설멓뻐섧멓뻐섡멓\n빠맣삸빠뭏숨멓뻐섵멓뻐섨멓뻐섫솘뭏뽀맣살빠맣샅빠맣샂뽀\n뿌섵멓뻐섮빠맣삸빠맣발빠밤따뚜뫃사본뽀섲멓뻐섡멓뻐섥멓\n맣산빠맣숫숨멓더번뻐섨멓뻐섵멓뽀섯멓뻐섡멓뻐섧멓뻐섬뽀\n멓뻐섰멓뻐빠맣삵빠빠맣맣샅빠맣삾빠발다맣삲빠맣샅빠뫃솥');
      interpreter.run();
      expect(output).toEqual('99 bottles of beer on the wall, 99 bottles of beer.\nTake one down and pass it around, 98 bottles of beer on the wall.\n98 bottles of beer on the wall, 98 bottles of beer.\nTake one down and pass it around, 97 bottles of beer on the wall.\n97 bottles of beer on the wall, 97 bottles of beer.\nTake one down and pass it around, 96 bottles of beer on the wall.\n96 bottles of beer on the wall, 96 bottles of beer.\nTake one down and pass it around, 95 bottles of beer on the wall.\n95 bottles of beer on the wall, 95 bottles of beer.\nTake one down and pass it around, 94 bottles of beer on the wall.\n94 bottles of beer on the wall, 94 bottles of beer.\nTake one down and pass it around, 93 bottles of beer on the wall.\n93 bottles of beer on the wall, 93 bottles of beer.\nTake one down and pass it around, 92 bottles of beer on the wall.\n92 bottles of beer on the wall, 92 bottles of beer.\nTake one down and pass it around, 91 bottles of beer on the wall.\n91 bottles of beer on the wall, 91 bottles of beer.\nTake one down and pass it around, 90 bottles of beer on the wall.\n90 bottles of beer on the wall, 90 bottles of beer.\nTake one down and pass it around, 89 bottles of beer on the wall.\n89 bottles of beer on the wall, 89 bottles of beer.\nTake one down and pass it around, 88 bottles of beer on the wall.\n88 bottles of beer on the wall, 88 bottles of beer.\nTake one down and pass it around, 87 bottles of beer on the wall.\n87 bottles of beer on the wall, 87 bottles of beer.\nTake one down and pass it around, 86 bottles of beer on the wall.\n86 bottles of beer on the wall, 86 bottles of beer.\nTake one down and pass it around, 85 bottles of beer on the wall.\n85 bottles of beer on the wall, 85 bottles of beer.\nTake one down and pass it around, 84 bottles of beer on the wall.\n84 bottles of beer on the wall, 84 bottles of beer.\nTake one down and pass it around, 83 bottles of beer on the wall.\n83 bottles of beer on the wall, 83 bottles of beer.\nTake one down and pass it around, 82 bottles of beer on the wall.\n82 bottles of beer on the wall, 82 bottles of beer.\nTake one down and pass it around, 81 bottles of beer on the wall.\n81 bottles of beer on the wall, 81 bottles of beer.\nTake one down and pass it around, 80 bottles of beer on the wall.\n80 bottles of beer on the wall, 80 bottles of beer.\nTake one down and pass it around, 79 bottles of beer on the wall.\n79 bottles of beer on the wall, 79 bottles of beer.\nTake one down and pass it around, 78 bottles of beer on the wall.\n78 bottles of beer on the wall, 78 bottles of beer.\nTake one down and pass it around, 77 bottles of beer on the wall.\n77 bottles of beer on the wall, 77 bottles of beer.\nTake one down and pass it around, 76 bottles of beer on the wall.\n76 bottles of beer on the wall, 76 bottles of beer.\nTake one down and pass it around, 75 bottles of beer on the wall.\n75 bottles of beer on the wall, 75 bottles of beer.\nTake one down and pass it around, 74 bottles of beer on the wall.\n74 bottles of beer on the wall, 74 bottles of beer.\nTake one down and pass it around, 73 bottles of beer on the wall.\n73 bottles of beer on the wall, 73 bottles of beer.\nTake one down and pass it around, 72 bottles of beer on the wall.\n72 bottles of beer on the wall, 72 bottles of beer.\nTake one down and pass it around, 71 bottles of beer on the wall.\n71 bottles of beer on the wall, 71 bottles of beer.\nTake one down and pass it around, 70 bottles of beer on the wall.\n70 bottles of beer on the wall, 70 bottles of beer.\nTake one down and pass it around, 69 bottles of beer on the wall.\n69 bottles of beer on the wall, 69 bottles of beer.\nTake one down and pass it around, 68 bottles of beer on the wall.\n68 bottles of beer on the wall, 68 bottles of beer.\nTake one down and pass it around, 67 bottles of beer on the wall.\n67 bottles of beer on the wall, 67 bottles of beer.\nTake one down and pass it around, 66 bottles of beer on the wall.\n66 bottles of beer on the wall, 66 bottles of beer.\nTake one down and pass it around, 65 bottles of beer on the wall.\n65 bottles of beer on the wall, 65 bottles of beer.\nTake one down and pass it around, 64 bottles of beer on the wall.\n64 bottles of beer on the wall, 64 bottles of beer.\nTake one down and pass it around, 63 bottles of beer on the wall.\n63 bottles of beer on the wall, 63 bottles of beer.\nTake one down and pass it around, 62 bottles of beer on the wall.\n62 bottles of beer on the wall, 62 bottles of beer.\nTake one down and pass it around, 61 bottles of beer on the wall.\n61 bottles of beer on the wall, 61 bottles of beer.\nTake one down and pass it around, 60 bottles of beer on the wall.\n60 bottles of beer on the wall, 60 bottles of beer.\nTake one down and pass it around, 59 bottles of beer on the wall.\n59 bottles of beer on the wall, 59 bottles of beer.\nTake one down and pass it around, 58 bottles of beer on the wall.\n58 bottles of beer on the wall, 58 bottles of beer.\nTake one down and pass it around, 57 bottles of beer on the wall.\n57 bottles of beer on the wall, 57 bottles of beer.\nTake one down and pass it around, 56 bottles of beer on the wall.\n56 bottles of beer on the wall, 56 bottles of beer.\nTake one down and pass it around, 55 bottles of beer on the wall.\n55 bottles of beer on the wall, 55 bottles of beer.\nTake one down and pass it around, 54 bottles of beer on the wall.\n54 bottles of beer on the wall, 54 bottles of beer.\nTake one down and pass it around, 53 bottles of beer on the wall.\n53 bottles of beer on the wall, 53 bottles of beer.\nTake one down and pass it around, 52 bottles of beer on the wall.\n52 bottles of beer on the wall, 52 bottles of beer.\nTake one down and pass it around, 51 bottles of beer on the wall.\n51 bottles of beer on the wall, 51 bottles of beer.\nTake one down and pass it around, 50 bottles of beer on the wall.\n50 bottles of beer on the wall, 50 bottles of beer.\nTake one down and pass it around, 49 bottles of beer on the wall.\n49 bottles of beer on the wall, 49 bottles of beer.\nTake one down and pass it around, 48 bottles of beer on the wall.\n48 bottles of beer on the wall, 48 bottles of beer.\nTake one down and pass it around, 47 bottles of beer on the wall.\n47 bottles of beer on the wall, 47 bottles of beer.\nTake one down and pass it around, 46 bottles of beer on the wall.\n46 bottles of beer on the wall, 46 bottles of beer.\nTake one down and pass it around, 45 bottles of beer on the wall.\n45 bottles of beer on the wall, 45 bottles of beer.\nTake one down and pass it around, 44 bottles of beer on the wall.\n44 bottles of beer on the wall, 44 bottles of beer.\nTake one down and pass it around, 43 bottles of beer on the wall.\n43 bottles of beer on the wall, 43 bottles of beer.\nTake one down and pass it around, 42 bottles of beer on the wall.\n42 bottles of beer on the wall, 42 bottles of beer.\nTake one down and pass it around, 41 bottles of beer on the wall.\n41 bottles of beer on the wall, 41 bottles of beer.\nTake one down and pass it around, 40 bottles of beer on the wall.\n40 bottles of beer on the wall, 40 bottles of beer.\nTake one down and pass it around, 39 bottles of beer on the wall.\n39 bottles of beer on the wall, 39 bottles of beer.\nTake one down and pass it around, 38 bottles of beer on the wall.\n38 bottles of beer on the wall, 38 bottles of beer.\nTake one down and pass it around, 37 bottles of beer on the wall.\n37 bottles of beer on the wall, 37 bottles of beer.\nTake one down and pass it around, 36 bottles of beer on the wall.\n36 bottles of beer on the wall, 36 bottles of beer.\nTake one down and pass it around, 35 bottles of beer on the wall.\n35 bottles of beer on the wall, 35 bottles of beer.\nTake one down and pass it around, 34 bottles of beer on the wall.\n34 bottles of beer on the wall, 34 bottles of beer.\nTake one down and pass it around, 33 bottles of beer on the wall.\n33 bottles of beer on the wall, 33 bottles of beer.\nTake one down and pass it around, 32 bottles of beer on the wall.\n32 bottles of beer on the wall, 32 bottles of beer.\nTake one down and pass it around, 31 bottles of beer on the wall.\n31 bottles of beer on the wall, 31 bottles of beer.\nTake one down and pass it around, 30 bottles of beer on the wall.\n30 bottles of beer on the wall, 30 bottles of beer.\nTake one down and pass it around, 29 bottles of beer on the wall.\n29 bottles of beer on the wall, 29 bottles of beer.\nTake one down and pass it around, 28 bottles of beer on the wall.\n28 bottles of beer on the wall, 28 bottles of beer.\nTake one down and pass it around, 27 bottles of beer on the wall.\n27 bottles of beer on the wall, 27 bottles of beer.\nTake one down and pass it around, 26 bottles of beer on the wall.\n26 bottles of beer on the wall, 26 bottles of beer.\nTake one down and pass it around, 25 bottles of beer on the wall.\n25 bottles of beer on the wall, 25 bottles of beer.\nTake one down and pass it around, 24 bottles of beer on the wall.\n24 bottles of beer on the wall, 24 bottles of beer.\nTake one down and pass it around, 23 bottles of beer on the wall.\n23 bottles of beer on the wall, 23 bottles of beer.\nTake one down and pass it around, 22 bottles of beer on the wall.\n22 bottles of beer on the wall, 22 bottles of beer.\nTake one down and pass it around, 21 bottles of beer on the wall.\n21 bottles of beer on the wall, 21 bottles of beer.\nTake one down and pass it around, 20 bottles of beer on the wall.\n20 bottles of beer on the wall, 20 bottles of beer.\nTake one down and pass it around, 19 bottles of beer on the wall.\n19 bottles of beer on the wall, 19 bottles of beer.\nTake one down and pass it around, 18 bottles of beer on the wall.\n18 bottles of beer on the wall, 18 bottles of beer.\nTake one down and pass it around, 17 bottles of beer on the wall.\n17 bottles of beer on the wall, 17 bottles of beer.\nTake one down and pass it around, 16 bottles of beer on the wall.\n16 bottles of beer on the wall, 16 bottles of beer.\nTake one down and pass it around, 15 bottles of beer on the wall.\n15 bottles of beer on the wall, 15 bottles of beer.\nTake one down and pass it around, 14 bottles of beer on the wall.\n14 bottles of beer on the wall, 14 bottles of beer.\nTake one down and pass it around, 13 bottles of beer on the wall.\n13 bottles of beer on the wall, 13 bottles of beer.\nTake one down and pass it around, 12 bottles of beer on the wall.\n12 bottles of beer on the wall, 12 bottles of beer.\nTake one down and pass it around, 11 bottles of beer on the wall.\n11 bottles of beer on the wall, 11 bottles of beer.\nTake one down and pass it around, 10 bottles of beer on the wall.\n10 bottles of beer on the wall, 10 bottles of beer.\nTake one down and pass it around, 9 bottles of beer on the wall.\n9 bottles of beer on the wall, 9 bottles of beer.\nTake one down and pass it around, 8 bottles of beer on the wall.\n8 bottles of beer on the wall, 8 bottles of beer.\nTake one down and pass it around, 7 bottles of beer on the wall.\n7 bottles of beer on the wall, 7 bottles of beer.\nTake one down and pass it around, 6 bottles of beer on the wall.\n6 bottles of beer on the wall, 6 bottles of beer.\nTake one down and pass it around, 5 bottles of beer on the wall.\n5 bottles of beer on the wall, 5 bottles of beer.\nTake one down and pass it around, 4 bottles of beer on the wall.\n4 bottles of beer on the wall, 4 bottles of beer.\nTake one down and pass it around, 3 bottles of beer on the wall.\n3 bottles of beer on the wall, 3 bottles of beer.\nTake one down and pass it around, 2 bottles of beer on the wall.\n2 bottles of beer on the wall, 2 bottles of beer.\nTake one down and pass it around, 1 bottle of beer on the wall.\n1 bottle of beer on the wall, 1 bottle of beer.\nTake one down and pass it around, no more bottles of beer on the wall.\nNo more bottles of beer on the wall, no more bottles of beer.\nGo to store and buy some more, 99 bottles of beer on the wall.\n');
    });

    it("should run Puzzlet's quine (585x9, 681 chars, 2062 bytes UTF-8) corectly", function () {
      // Code from http://puzzlet.org/personal/wiki.php/%EC%95%84%ED%9D%AC~%EC%BD%B0%EC%9D%B8
      interpreter.setProgram('버분벗벖벓법벌벋벖법벍벋벌벋벌벗벌벍벌벋벗벓벖법벌벋벖벌벗벓벌벋벗벌벗벓벌벋벖벋벓벋벌벋벗벓벖법벌벋벌법법벓벌벋벗벖벓법벌벋벖법벍벋벌벋벌벗벖벓벌벋버벖법벍벋벌벋벒벋벓벓벌벋벖벍벍벌벍벋벗법벌벒벌벋벗벋법벓벌벋벖벋벓벋벌벋벖벓벖벍벌벋벗벌법벓벖벋벒벋벓벓벌벋벌벋벌벓벌벋벖벖벌벋벌벋벗벌벒법벌벋벗벍벍법벌벋버벗벓벗벋벖벋벗법벗벌벌벋벖벌벗벓벌벋벖벌벗벓벌벋벗벍벗벓벖벋벗벗벍벒벌벋벗벋벒벌벖벋벌벖벗벓벌벋벖벌벋법벍벋벖벋벖벋벍벋버벖벍벒벋벍벋벗벗벌벗벍벋벗벌벗벓벌벋벖벌벋벖벌벋벌벌벗벓벌벋벗벒벍벗벌벋벗벒벌벓벌벋벗법벋벓벌벋벖벋벒벒벌벋벗벋법벓벌벋벗벖벓벗벍벋버벖벋벓벗벖벋벗벒벌벋벖벋벗벖벓벗벍벋벖벗벒벋벌벋벌벖벗벓벌벋벋벖벗벓벌벋벗법벋법벌벋벖벖벗벓벌벋벖벍벒벌벌벋벗벋벖벓벖벋벖법벓벓벖벋벗벖벋벒벌벋벖벍벌법벖벋버벖벖벌벋벌벋벖벋벒벒벌벋벍벗벌벗벖벋벖벖벌벋벌벋벖벒벍법벖벋벓벌벋벓벌벋벖벒벍법벖벋벗법벌벗벌벋벖벒벍법벖벋벗법벋벓벌벋벖벒벍법벖벋벖벒벗벗벖벋벌벖벒벖벌벋버벒법법벓벌벋벖법벍벋벌벋벗법벌벒벌벋벋벗벓벋벖벋벗법벌벒벌벋벌법벋벍벌벋벌법법벓벌벋벌법법벓벌벋벖법법벓벌벋벗벖벓법벌벋벗벖벓법벌벋벗법벋법벌벋버벖벌법벌벌벋벗벗벌벗벍벋벋벖벗벓벌벋벗벓벖법벌벋벗벓벖법벌벋벌벖벗벓벌벋벗벖벗벓벌벋벗벖벗벓벌벋벗벓벖법벌벋벗벓벖법벌벋벒벋법벓벌벋벗벌벋벓벌벋\n뱘벏따따밠밠밣따따밡타뚜\n두떠떠범벓벓멓뻐쎁뻐더벗\n맣쀼야뱐야냐야뱞야다샅뿌다\n쓬빠추초러밤두밡밣도토싸소\n토번뿌뱐본노받로반타포\n파표밣쟈뽀차발발또숰\n땨뗘다볋붏처무뎌번뻐희붏더\n봃더떠벓따뎌반발따뫃더떠');
      interpreter.run();
      expect(output).toEqual('버분벗벖벓법벌벋벖법벍벋벌벋벌벗벌벍벌벋벗벓벖법벌벋벖벌벗벓벌벋벗벌벗벓벌벋벖벋벓벋벌벋벗벓벖법벌벋벌법법벓벌벋벗벖벓법벌벋벖법벍벋벌벋벌벗벖벓벌벋버벖법벍벋벌벋벒벋벓벓벌벋벖벍벍벌벍벋벗법벌벒벌벋벗벋법벓벌벋벖벋벓벋벌벋벖벓벖벍벌벋벗벌법벓벖벋벒벋벓벓벌벋벌벋벌벓벌벋벖벖벌벋벌벋벗벌벒법벌벋벗벍벍법벌벋버벗벓벗벋벖벋벗법벗벌벌벋벖벌벗벓벌벋벖벌벗벓벌벋벗벍벗벓벖벋벗벗벍벒벌벋벗벋벒벌벖벋벌벖벗벓벌벋벖벌벋법벍벋벖벋벖벋벍벋버벖벍벒벋벍벋벗벗벌벗벍벋벗벌벗벓벌벋벖벌벋벖벌벋벌벌벗벓벌벋벗벒벍벗벌벋벗벒벌벓벌벋벗법벋벓벌벋벖벋벒벒벌벋벗벋법벓벌벋벗벖벓벗벍벋버벖벋벓벗벖벋벗벒벌벋벖벋벗벖벓벗벍벋벖벗벒벋벌벋벌벖벗벓벌벋벋벖벗벓벌벋벗법벋법벌벋벖벖벗벓벌벋벖벍벒벌벌벋벗벋벖벓벖벋벖법벓벓벖벋벗벖벋벒벌벋벖벍벌법벖벋버벖벖벌벋벌벋벖벋벒벒벌벋벍벗벌벗벖벋벖벖벌벋벌벋벖벒벍법벖벋벓벌벋벓벌벋벖벒벍법벖벋벗법벌벗벌벋벖벒벍법벖벋벗법벋벓벌벋벖벒벍법벖벋벖벒벗벗벖벋벌벖벒벖벌벋버벒법법벓벌벋벖법벍벋벌벋벗법벌벒벌벋벋벗벓벋벖벋벗법벌벒벌벋벌법벋벍벌벋벌법법벓벌벋벌법법벓벌벋벖법법벓벌벋벗벖벓법벌벋벗벖벓법벌벋벗법벋법벌벋버벖벌법벌벌벋벗벗벌벗벍벋벋벖벗벓벌벋벗벓벖법벌벋벗벓벖법벌벋벌벖벗벓벌벋벗벖벗벓벌벋벗벖벗벓벌벋벗벓벖법벌벋벗벓벖법벌벋벒벋법벓벌벋벗벌벋벓벌벋\n뱘벏따따밠밠밣따따밡타뚜\n두떠떠범벓벓멓뻐쎁뻐더벗\n맣쀼야뱐야냐야뱞야다샅뿌다\n쓬빠추초러밤두밡밣도토싸소\n토번뿌뱐본노받로반타포\n파표밣쟈뽀차발발또숰\n땨뗘다볋붏처무뎌번뻐희붏더\n봃더떠벓따뎌반발따뫃더떠');
    });

    it("should run Puzzlet's quine program (40x47, 1588 chars, 4859 bytes UTF-8) corectly", function () {
      // Code from http://puzzlet.org/personal/wiki.php/%EC%95%84%ED%9D%AC~%EC%BD%B0%EC%9D%B8
      interpreter.setProgram('상밢밢밣밦발받밧밥밣밦밦받밦밢밝받밝받밦밧밢받발받밧밣밦밥발받밝밥밧밦밦받밧받붑\n붇벌벖벒벖벌벋벖법벍벒벖벋벍벌벍벍벖버벋벌벍벌벗벌벋벌법벓벖벗벋벌벓법벋벖벋벌벓\n밦밦발받발받밧밣밦밥발받발밦밧밣발받밦밦발받발받밧밣밦밥발받발밦밧밣발받밦밦발붇\n붉벗벋벌벓벓벋벒벋벌벓벗벖벌벋벌법벖벓벗벋벌벋벌벖벖벋벌벓벗벖벌벋벌법벖벓벗벋벌\n밧밣밦받밦밣밦밝발받밧받밢발밦받밦밥밧밣발받밧밦받밢발받바밦밝밢밥밦받밧밧발밣불\n붒벓벍벋벌벋벍법벖벋벖법벒벍벖벋벌벓벌벋벓벋벖법벒벍벖벋벌벗벍벗벗벋벖법벒벍벖벋\n밧밦받밧받밦밢발받밦밧밢받발받밧밝밝받밦받밦밦발밧밦받바밧밝밝받밦받밦받밣밧밦붇\n붏법법벋벋벌벋벒벗벖벋벌벓법법벖벋벌벌벍벒벖벋벖벓벓법벖벋벖벓벖벋벗벋벌벒벌법벗\n발받발밥밥밣발받밧밥받밥발받밦밝밧받밝받밧밢발밣발받밝밝밥밧밦받밦밥밥밣발받밦붏\n불벓벓벗벖벋벌벓벌벗벗벋벌벒벍벗벗벋벖법벋벒벖벋벌벒벍벗벗벋벖벋벗벍벍버벋벌벓벍\n받밦밧밧받발받발받밥밣발받밧밝발밦발받밧받밥밣발받밧밣밦밧밝받밧밢받밥밝받밧밦붏\n붇벌벓법법벌벋벍벋벗벍벖벋벌벓법벋벗버벋벌벋벍법벖벋벖벋벓벓벗벋벖벗벖벌벖벋벍벗\n밧밢밧밦밦받밦받밢밢발받밧발밥밣밦받밦받밥밣발받밦받밥밣발받밦발밥발발받밧받밥붏\n붓벋벌벌벗법벗버벋벌벌벗법벗벋벌벓벒벒벋벋벖벓벓법벖벋벌벒법벌벗벋벖벖벗벒벗벋벌\n밣밦밥발받밦밦밧밣발받밦밦밧밣발받밝발밧밣발받밝밧발밧밦받발밥받밝발받밦밧밝밥붒\n붓벌벍벋벌벓벗벖벖벋벌법벖벓벗벋벌법벖벓벗벋벌벋벌벖벖벋벖벋벖벋벗벋벖벗벌벓벖벋\n밣발받밦발밦밧밦받밣밥받밣발받밦받밦발발받바밧밢발밣발받밧밧발밧밝받밦밧밢받발붇\n붑벍벒벖벋벌벋벌벖벖벋벖벗벌벗벍벋벌벒벍벗벗벋벌벓벗벖벓벋벌벓벋법벍벋벌법벒벌벗\n밦받밣발받밣발받밦밢밝밥밦받밧밥발밧발받밦밢밝밥밦받밧밥받밣발받밦밢밝밥밦받발붑\n불벓벓법벗벋벌벌벗법벗벋벌벓벋법벖벋벌벓벌벒벖버벋벌법벍벍벗벋벖벋법벖벋벋벌벍벋\n받밧밧밝밢발받받밦밧밣발받밧발밢받밦받밦밝밧받밝받밧밥받밥발받발밦밧밣발받받밦붓\n붓벋벌벒벋벖벗벋벖벓벖벋벗벋벖벓벓법벖벋벌벌벒벍벖벋벌벓벗벖벖벋벌벋벒벗벖벋벌벓\n밣밣밢발받밦밧밣밣발받바밧밣밧받밦받밧밥밧발발받밢받밝밝발받밦밦발받발받받받밣붏\n붉벗벋벌벓벗벌벗벋벍벗벌벗벗벋벍법벋벒벗벋벖벗벓벋벖벋벌벒벒벋벖벋벌벌벗법벗벋벌\n발밦발받발발밧밣발받밦밧밧받발받밦밧밣밣발받밧밥받밣발받밧밧밝밢발받밦밢받밥밦붇\n붎벋벗벋벖벋벗벌벗벋벖벓법벌벗벋벖벗법벍벖벋벌벖벒벖벌버벋벖벋벌벒벗벋벖벋벗벌벗\n발밦받밧밥받밥발받밦받밣받발받밧밥받밣발받밝밝밥밧밦받밦발밥발발받밦발밧밣발받붒\n불벓벗벌벗벋벍벋벗벍벖벋벌벓벗벖벌벋벖벌벒벋벗벋벌벒벒벋벖벋벖벓벗벍벗벋벌벓벗벌\n받밝밝밧받밦받바밧밦밣밥발받밧밦밣밥발받받받밥밣발받밧밣밦밧밝받발밥받밝발받밝붏\n붇벌벒벌법벗벋벍벗벖벓벗벋벌벓법벋벗벋벌법벓벖벗벋벌벒벌법벗벋벌벓법벋벖벋벖벗벖\n밧밦밣밥발받밣밥밥밣발받밝받밥밣발받밦밥밝받발받밧밦밣밥발받밝받밥밣발받밧밦밣붑\n불벋벌벓벗벌벗벋벌법벖벓벗벋벌법벖벓벗벋벌벌법벌벖버벋벌법벋법벗벋벌벓법벋벓벋벌\n발밧밣발받받발밧밣발받받발밧밣발받밝발밧밣발받밧밧발밧밝받밧발밧밣발받밧밣밦밥불\n붑벍벖벋벌벓벗벌벌벋벖벋벌벒벋벋벌벓벗법벖벋벖벋벌벒법벋벌벓벗벌벍벋벌벒벋벖벗벋\n밧밦받사받싹바싺밝빠따반타밝밙밙받반따따뚜\n두벎떠벍떠더벍벖떠뻐터번떠뻐벌섵멓터벉떠떠\n숭반투밣쟈뿌차발발뚜삭뱐뎌두쟈수처사맣\n싸수쑼뽀뱐분누받루반타푸소뿌또붉다뭏또숰\n분뾰빠초추러밤도밡밣두투쏘밡뽀붐또뱔볼\n땨슡멓야뱐야냐야뱞야다샅뽀밦뱕뗘도타본\n뜌뱖서밝밤따따다쌈샴아멓샅밝밤밤따또\n또뷹추뺘져번뚜벌벌처뿌져벓투번\n더쎰서토푸터번루벋누분변뽀쑼뽀숭\n뵴범삭본투두벓벑도범라추초뻐소써\n샤써도뼈섵더여볎여녀여변여\n빠바쟈무차붏밣따다밣따다밣따다밣따다맣야희\n뫃떠벌번정따도퍼즐릿');
      interpreter.run();
      expect(output).toEqual('상밢밢밣밦발받밧밥밣밦밦받밦밢밝받밝받밦밧밢받발받밧밣밦밥발받밝밥밧밦밦받밧받붑\n붇벌벖벒벖벌벋벖법벍벒벖벋벍벌벍벍벖버벋벌벍벌벗벌벋벌법벓벖벗벋벌벓법벋벖벋벌벓\n밦밦발받발받밧밣밦밥발받발밦밧밣발받밦밦발받발받밧밣밦밥발받발밦밧밣발받밦밦발붇\n붉벗벋벌벓벓벋벒벋벌벓벗벖벌벋벌법벖벓벗벋벌벋벌벖벖벋벌벓벗벖벌벋벌법벖벓벗벋벌\n밧밣밦받밦밣밦밝발받밧받밢발밦받밦밥밧밣발받밧밦받밢발받바밦밝밢밥밦받밧밧발밣불\n붒벓벍벋벌벋벍법벖벋벖법벒벍벖벋벌벓벌벋벓벋벖법벒벍벖벋벌벗벍벗벗벋벖법벒벍벖벋\n밧밦받밧받밦밢발받밦밧밢받발받밧밝밝받밦받밦밦발밧밦받바밧밝밝받밦받밦받밣밧밦붇\n붏법법벋벋벌벋벒벗벖벋벌벓법법벖벋벌벌벍벒벖벋벖벓벓법벖벋벖벓벖벋벗벋벌벒벌법벗\n발받발밥밥밣발받밧밥받밥발받밦밝밧받밝받밧밢발밣발받밝밝밥밧밦받밦밥밥밣발받밦붏\n불벓벓벗벖벋벌벓벌벗벗벋벌벒벍벗벗벋벖법벋벒벖벋벌벒벍벗벗벋벖벋벗벍벍버벋벌벓벍\n받밦밧밧받발받발받밥밣발받밧밝발밦발받밧받밥밣발받밧밣밦밧밝받밧밢받밥밝받밧밦붏\n붇벌벓법법벌벋벍벋벗벍벖벋벌벓법벋벗버벋벌벋벍법벖벋벖벋벓벓벗벋벖벗벖벌벖벋벍벗\n밧밢밧밦밦받밦받밢밢발받밧발밥밣밦받밦받밥밣발받밦받밥밣발받밦발밥발발받밧받밥붏\n붓벋벌벌벗법벗버벋벌벌벗법벗벋벌벓벒벒벋벋벖벓벓법벖벋벌벒법벌벗벋벖벖벗벒벗벋벌\n밣밦밥발받밦밦밧밣발받밦밦밧밣발받밝발밧밣발받밝밧발밧밦받발밥받밝발받밦밧밝밥붒\n붓벌벍벋벌벓벗벖벖벋벌법벖벓벗벋벌법벖벓벗벋벌벋벌벖벖벋벖벋벖벋벗벋벖벗벌벓벖벋\n밣발받밦발밦밧밦받밣밥받밣발받밦받밦발발받바밧밢발밣발받밧밧발밧밝받밦밧밢받발붇\n붑벍벒벖벋벌벋벌벖벖벋벖벗벌벗벍벋벌벒벍벗벗벋벌벓벗벖벓벋벌벓벋법벍벋벌법벒벌벗\n밦받밣발받밣발받밦밢밝밥밦받밧밥발밧발받밦밢밝밥밦받밧밥받밣발받밦밢밝밥밦받발붑\n불벓벓법벗벋벌벌벗법벗벋벌벓벋법벖벋벌벓벌벒벖버벋벌법벍벍벗벋벖벋법벖벋벋벌벍벋\n받밧밧밝밢발받받밦밧밣발받밧발밢받밦받밦밝밧받밝받밧밥받밥발받발밦밧밣발받받밦붓\n붓벋벌벒벋벖벗벋벖벓벖벋벗벋벖벓벓법벖벋벌벌벒벍벖벋벌벓벗벖벖벋벌벋벒벗벖벋벌벓\n밣밣밢발받밦밧밣밣발받바밧밣밧받밦받밧밥밧발발받밢받밝밝발받밦밦발받발받받받밣붏\n붉벗벋벌벓벗벌벗벋벍벗벌벗벗벋벍법벋벒벗벋벖벗벓벋벖벋벌벒벒벋벖벋벌벌벗법벗벋벌\n발밦발받발발밧밣발받밦밧밧받발받밦밧밣밣발받밧밥받밣발받밧밧밝밢발받밦밢받밥밦붇\n붎벋벗벋벖벋벗벌벗벋벖벓법벌벗벋벖벗법벍벖벋벌벖벒벖벌버벋벖벋벌벒벗벋벖벋벗벌벗\n발밦받밧밥받밥발받밦받밣받발받밧밥받밣발받밝밝밥밧밦받밦발밥발발받밦발밧밣발받붒\n불벓벗벌벗벋벍벋벗벍벖벋벌벓벗벖벌벋벖벌벒벋벗벋벌벒벒벋벖벋벖벓벗벍벗벋벌벓벗벌\n받밝밝밧받밦받바밧밦밣밥발받밧밦밣밥발받받받밥밣발받밧밣밦밧밝받발밥받밝발받밝붏\n붇벌벒벌법벗벋벍벗벖벓벗벋벌벓법벋벗벋벌법벓벖벗벋벌벒벌법벗벋벌벓법벋벖벋벖벗벖\n밧밦밣밥발받밣밥밥밣발받밝받밥밣발받밦밥밝받발받밧밦밣밥발받밝받밥밣발받밧밦밣붑\n불벋벌벓벗벌벗벋벌법벖벓벗벋벌법벖벓벗벋벌벌법벌벖버벋벌법벋법벗벋벌벓법벋벓벋벌\n발밧밣발받받발밧밣발받받발밧밣발받밝발밧밣발받밧밧발밧밝받밧발밧밣발받밧밣밦밥불\n붑벍벖벋벌벓벗벌벌벋벖벋벌벒벋벋벌벓벗법벖벋벖벋벌벒법벋벌벓벗벌벍벋벌벒벋벖벗벋\n밧밦받사받싹바싺밝빠따반타밝밙밙받반따따뚜\n두벎떠벍떠더벍벖떠뻐터번떠뻐벌섵멓터벉떠떠\n숭반투밣쟈뿌차발발뚜삭뱐뎌두쟈수처사맣\n싸수쑼뽀뱐분누받루반타푸소뿌또붉다뭏또숰\n분뾰빠초추러밤도밡밣두투쏘밡뽀붐또뱔볼\n땨슡멓야뱐야냐야뱞야다샅뽀밦뱕뗘도타본\n뜌뱖서밝밤따따다쌈샴아멓샅밝밤밤따또\n또뷹추뺘져번뚜벌벌처뿌져벓투번\n더쎰서토푸터번루벋누분변뽀쑼뽀숭\n뵴범삭본투두벓벑도범라추초뻐소써\n샤써도뼈섵더여볎여녀여변여\n빠바쟈무차붏밣따다밣따다밣따다밣따다맣야희\n뫃떠벌번정따도퍼즐릿');
    });

    it('should run 안녕하세요? program corectly', function () {
      // Code from http://puzzlet.org/personal/wiki.php/%EC%95%84%ED%9D%AC~%EC%95%88%EB%85%95%ED%95%98%EC%84%B8%EC%9A%94
      interpreter.setProgram('어듀벊벖버범벅벖떠벋벍떠벑번뻐버떠뻐벚벌버더벊벖떠벛벜버버\n　ㅇ　　ㅏㄴㄴㅕㅇ　　ㅎ　　ㅏ　ㅅ　　ㅔ　ㅇ　　ㅛ　　　\0\n　뿌멓더떠떠떠떠더벋떠벌뻐뻐뻐\n붉차밠밪따따다밠밨따따다　박봃\n받빠따따맣반발따맣아희～');
      interpreter.run();
      expect(output).toEqual('안녕하세요?\n');
    });

    it("should run codroc's Fibonacci program corectly", function () {
      // Code from http://puzzlet.org/personal/wiki.php/%EC%95%84%ED%9D%AC~%ED%94%BC%EB%B3%B4%EB%82%98%EC%B9%98%EC%88%98%EC%97%B4
      interpreter.setProgram('반반나빠빠쌈다빠망빠쌈삼파싸사빠발발밖따따쟈하처우\nㅇㅇㅇㅇㅇㅇ오어어어어어어어어어어어어어어어어어어');
      interpreter.run();
      expect(output).toEqual('23581321345589144233');
    });

    it("should run Puzzlet's Fibonacci program corectly", function () {
      // Code from http://puzzlet.org/personal/wiki.php/%EC%95%84%ED%9D%AC~%ED%94%BC%EB%B3%B4%EB%82%98%EC%B9%98%EC%88%98%EC%97%B4
      interpreter.setProgram('분받분쌍쌍상빠쌍다쑹\n발또타보라뫃뻐서멍뻐');
      interpreter.run(700);
      expect(output).toEqual('1\n1\n2\n3\n5\n8\n13\n21\n34\n55\n89\n144\n233\n377\n610\n987\n1597\n2584\n4181\n6765\n10946\n17711\n28657\n46368\n75025\n121393\n196418\n317811\n514229\n832040\n1346269\n2178309\n3524578\n5702887\n9227465\n14930352\n24157817\n39088169\n63245986\n102334155\n165580141\n267914296\n433494437\n701408733\n1134903170\n1836311903\n2971215073\n4807526976\n7778742049\n12586269025\n20365011074\n32951280099\n53316291173\n86267571272\n139583862445\n225851433717\n365435296162\n591286729879\n956722026041\n1548008755920\n2504730781961\n4052739537881\n6557470319842\n10610209857723\n17167680177565\n27777890035288\n44945570212853\n72723460248141\n117669030460994\n');
    });

    it('should run Prime program correctly', function () {
      var program = '붕박투받타뚜\n빠복쟈본차뿌\n희뿌차뿌져번\n몽터주벋받북\n로범차빠속투\n뽀수써투벅벋\n추러뽀더빠속\n빠삭빠싸사뿌\n망희챠저요뗘';
      spyOn(window, 'prompt').andReturn('47182813');
      interpreter.setProgram(program);
      interpreter.run();
      expect(output).toEqual('47182813');
      output = '';
      window.prompt.andReturn('47485817');
      interpreter.setProgram(program);
      interpreter.run();
      expect(output).toEqual('0');
    });
  });
});
