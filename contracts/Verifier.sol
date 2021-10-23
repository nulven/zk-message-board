pragma solidity ^0.8.3;
pragma abicoder v2;
import "./Pairing.sol";

library Verifier {
  
  using Pairing for *;
  struct VerifyingKey {
      Pairing.G1Point alfa1;
      Pairing.G2Point beta2;
      Pairing.G2Point gamma2;
      Pairing.G2Point delta2;
      Pairing.G1Point[] IC;
  }
  struct Proof {
      Pairing.G1Point A;
      Pairing.G2Point B;
      Pairing.G1Point C;
  }
  function verify(
    uint[] memory input,
    Proof memory proof,
    VerifyingKey memory vk
  ) internal view returns (uint) {
    uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    require(input.length + 1 == vk.IC.length,"verifier-bad-input");
    // Compute the linear combination vk_x
    Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
    for (uint i = 0; i < input.length; i++) {
        require(input[i] < snark_scalar_field,"verifier-gte-snark-scalar-field");
        vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[i + 1], input[i]));
    }
    vk_x = Pairing.addition(vk_x, vk.IC[0]);
    if (!Pairing.pairingProd4(
        Pairing.negate(proof.A), proof.B,
        vk.alfa1, vk.beta2,
        vk_x, vk.gamma2,
        proof.C, vk.delta2
    )) return 1;
    return 0;
  }
  function verifyProof(
    uint[2] memory a,
    uint[2][2] memory b,
    uint[2] memory c,
    uint[] memory input,
    VerifyingKey memory vk
  ) public view returns (bool) {
    Proof memory proof;
    proof.A = Pairing.G1Point(a[0], a[1]);
    proof.B = Pairing.G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]);
    proof.C = Pairing.G1Point(c[0], c[1]);
    if (verify(input, proof, vk) == 0) {
        return true;
    } else {
        return false;
    }
  }

  function hashCheckVerifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alfa1 = Pairing.G1Point(19642524115522290447760970021746675789341356000653265441069630957431566301675,15809037446102219312954435152879098683824559980020626143453387822004586242317);
        vk.beta2 = Pairing.G2Point([6402738102853475583969787773506197858266321704623454181848954418090577674938,3306678135584565297353192801602995509515651571902196852074598261262327790404], [15158588411628049902562758796812667714664232742372443470614751812018801551665,4983765881427969364617654516554524254158908221590807345159959200407712579883]);
        vk.gamma2 = Pairing.G2Point([11559732032986387107991004021392285783925812861821192530917403151452391805634,10857046999023057135944570762232829481370756359578518086990519993285655852781], [4082367875863433681332203403145435568316851327593401208105741076214120093531,8495653923123431417604973247489272438418190587263600148770280649306958101930]);
        vk.delta2 = Pairing.G2Point([11078114351411396302492606863995638386506537365844689646898417550998267219414,2528491300866434509699704412642731178102268865012248785813458721505586631446], [7646900014588577959937375249841784560277351960820231527167492175864420231155,17448560587075395769884970409122010185777125947946128673908172602768905142360]);
        vk.IC = new Pairing.G1Point[](3);
        vk.IC[0] = Pairing.G1Point(17090106865544016169649801204752202247083129013270491555521198841473080041238,15065980597515084559860077870742922078916767487317684783582391086408942818065);
        vk.IC[1] = Pairing.G1Point(10558445759831135442058925443498488148212015715797646160464785406589513284315,570388984953131874409584534668928547003072313277119781960318255158652063828);
        vk.IC[2] = Pairing.G1Point(15654332796535608845541880529282070389959363879991967411583717763173198481485,17779979896292565142878945666430181979415562527063461703121818492308262454660);

  }
  function verifyHashCheckProof(
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c,
    uint256[2] memory input
  ) public view returns (bool) {
    uint256[] memory inputValues = new uint256[](input.length);
    for (uint256 i = 0; i < input.length; i++) {
      inputValues[i] = input[i];
    }
    return verifyProof(a, b, c, inputValues, hashCheckVerifyingKey());
  }

function hashCheckBitsVerifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alfa1 = Pairing.G1Point(20491192805390485299153009773594534940189261866228447918068658471970481763042,9383485363053290200918347156157836566562967994039712273449902621266178545958);
        vk.beta2 = Pairing.G2Point([4252822878758300859123897981450591353533073413197771768651442665752259397132,6375614351688725206403948262868962793625744043794305715222011528459656738731], [21847035105528745403288232691147584728191162732299865338377159692350059136679,10505242626370262277552901082094356697409835680220590971873171140371331206856]);
        vk.gamma2 = Pairing.G2Point([11559732032986387107991004021392285783925812861821192530917403151452391805634,10857046999023057135944570762232829481370756359578518086990519993285655852781], [4082367875863433681332203403145435568316851327593401208105741076214120093531,8495653923123431417604973247489272438418190587263600148770280649306958101930]);
        vk.delta2 = Pairing.G2Point([11078114351411396302492606863995638386506537365844689646898417550998267219414,2528491300866434509699704412642731178102268865012248785813458721505586631446], [7646900014588577959937375249841784560277351960820231527167492175864420231155,17448560587075395769884970409122010185777125947946128673908172602768905142360]);
        vk.IC = new Pairing.G1Point[](3);
        vk.IC[0] = Pairing.G1Point(5570366484129396797820283198918075645730988286749201790647292970884386797853,1653967695403142370175641873918383409788792267718717820338872738589029523480);
        vk.IC[1] = Pairing.G1Point(664918587154170469538361850450715955733034546676415417021062262030700935072,9291168664414769551664827465785673362873345922980390440758807924555125201782);
        vk.IC[2] = Pairing.G1Point(17329746074209890583679268791560019759146357078109924475864991517402222023673,9411853105642653318881683114793277354296229689973802088892105448108377180140);

  }
  function verifyHashCheckBitsProof(
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c,
    uint256[2] memory input
  ) public view returns (bool) {
    uint256[] memory inputValues = new uint256[](input.length);
    for (uint256 i = 0; i < input.length; i++) {
      inputValues[i] = input[i];
    }
    return verifyProof(a, b, c, inputValues, hashCheckBitsVerifyingKey());
  }

function sigCheckVerifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alfa1 = Pairing.G1Point(20491192805390485299153009773594534940189261866228447918068658471970481763042,9383485363053290200918347156157836566562967994039712273449902621266178545958);
        vk.beta2 = Pairing.G2Point([4252822878758300859123897981450591353533073413197771768651442665752259397132,6375614351688725206403948262868962793625744043794305715222011528459656738731], [21847035105528745403288232691147584728191162732299865338377159692350059136679,10505242626370262277552901082094356697409835680220590971873171140371331206856]);
        vk.gamma2 = Pairing.G2Point([11559732032986387107991004021392285783925812861821192530917403151452391805634,10857046999023057135944570762232829481370756359578518086990519993285655852781], [4082367875863433681332203403145435568316851327593401208105741076214120093531,8495653923123431417604973247489272438418190587263600148770280649306958101930]);
        vk.delta2 = Pairing.G2Point([11078114351411396302492606863995638386506537365844689646898417550998267219414,2528491300866434509699704412642731178102268865012248785813458721505586631446], [7646900014588577959937375249841784560277351960820231527167492175864420231155,17448560587075395769884970409122010185777125947946128673908172602768905142360]);
        vk.IC = new Pairing.G1Point[](15);
        vk.IC[0] = Pairing.G1Point(835677852169873511519565045204546237605306526589323870167790359033380198681,5340310817125928809142541406140115117232145550126510989520920143468073468383);
        vk.IC[1] = Pairing.G1Point(4299462425783793489881502659096751082310535842831194980542236192316454443829,791464819342210888817868296499127182535380220818121806080855163013720711172);
        vk.IC[2] = Pairing.G1Point(9322340022732410051454153361678468624591032221216103359209196459747039278084,17371874999609243651192181809099119279467059386272930600805100816694438414940);
        vk.IC[3] = Pairing.G1Point(4656738978391258997209304324914368205084888401562732840128726272208337293665,13465704043179438640840713676252070910167886274143078527678265581774248993910);
        vk.IC[4] = Pairing.G1Point(16285400457443501903985631660355925176925607727563398482654066848518403625603,14739589367648290267945217419720528869781055448265050012661716177839330841547);
        vk.IC[5] = Pairing.G1Point(796835721697706836723267986975328506998150315164361069396220080972662655490,17906783235745969651954560412035489911962556016343451202503253735985805243491);
        vk.IC[6] = Pairing.G1Point(20274222802550096569064092599128106199617712695084742875104558376499496601343,12404757103718785308906368097305053840117992430384415414630290177660196433936);
        vk.IC[7] = Pairing.G1Point(18556486317202438211671313268547525091841704658206972718319353670718109786530,2722043283731137870263661830823525889850549458682410016846327362503312240783);
        vk.IC[8] = Pairing.G1Point(13442644890638719038508405192564432332213135066915205118417015961375582771243,20017296889207240027718641959683645160461624669204954708389778064175623255926);
        vk.IC[9] = Pairing.G1Point(12195453021609082854117729842440706032399256429383216064211594483586113827518,6982480603347853233055780512198792261889082366947247249078321229708380607074);
        vk.IC[10] = Pairing.G1Point(7209727166289124741096799067132147273922450407187355593248114433565843212445,9111554778116258355097035393700774206796827836597644490872626907902987651489);
        vk.IC[11] = Pairing.G1Point(10448363231616698449746664902898889239689309798244869442065033821557970393410,13952456363574426448451478628392472838706861258721158739147299399631473895321);
        vk.IC[12] = Pairing.G1Point(7870214160521077271712349727306539319267243259862683820278988735495238317062,7492412274622668383442505548089271763023234974371771453192502583271526349996);
        vk.IC[13] = Pairing.G1Point(1808307217116050245466065068996148001305477672842410062116798633642451265799,7612621230364857493084306027042532926630207484742747695398592953268935585309);
        vk.IC[14] = Pairing.G1Point(7511880614100288624322789149877270520948349997987451031656417092754771598996,18282762304889939490606193415262256223781870562928111931015596971765885281030);

  }
  function verifySigCheckProof(
    uint256[2] memory a,
    uint256[2][2] memory b,
    uint256[2] memory c,
    uint256[14] memory input
  ) public view returns (bool) {
    uint256[] memory inputValues = new uint256[](input.length);
    for (uint256 i = 0; i < input.length; i++) {
      inputValues[i] = input[i];
    }
    return verifyProof(a, b, c, inputValues, sigCheckVerifyingKey());
  }
}
