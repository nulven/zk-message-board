//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// 2019 OKIMS
//      ported to solidity 0.6
//      fixed linter warnings
//      added requiere error messages
//
//
// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.7.6; // >=0.5.16 <=
pragma experimental ABIEncoderV2;
import './Pairing.sol';

library SigCheckVerifier {
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
    function verifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alfa1 = Pairing.G1Point(20491192805390485299153009773594534940189261866228447918068658471970481763042,9383485363053290200918347156157836566562967994039712273449902621266178545958);
        vk.beta2 = Pairing.G2Point([4252822878758300859123897981450591353533073413197771768651442665752259397132,6375614351688725206403948262868962793625744043794305715222011528459656738731], [21847035105528745403288232691147584728191162732299865338377159692350059136679,10505242626370262277552901082094356697409835680220590971873171140371331206856]);
        vk.gamma2 = Pairing.G2Point([11559732032986387107991004021392285783925812861821192530917403151452391805634,10857046999023057135944570762232829481370756359578518086990519993285655852781], [4082367875863433681332203403145435568316851327593401208105741076214120093531,8495653923123431417604973247489272438418190587263600148770280649306958101930]);
        vk.delta2 = Pairing.G2Point([11078114351411396302492606863995638386506537365844689646898417550998267219414,2528491300866434509699704412642731178102268865012248785813458721505586631446], [7646900014588577959937375249841784560277351960820231527167492175864420231155,17448560587075395769884970409122010185777125947946128673908172602768905142360]);
        vk.IC = new Pairing.G1Point[](13);
        vk.IC[0] = Pairing.G1Point(8579094931922711600858859692813930562927842113554377197771718224553737403800,7287797520250669503999429113682605150904762821357420759338270581052520446470);
        vk.IC[1] = Pairing.G1Point(4123622387804504063965480909411429632401006320627380992975863748867274542039,3951229429212815181138659544622116042593448358329655694377042147553778026951);
        vk.IC[2] = Pairing.G1Point(21755387967719441932464230052018957263849590428074572389583909216522086673430,9946310862712474452793062617525275787911637226061598897830433170799231816247);
        vk.IC[3] = Pairing.G1Point(2835565892684290106990995138933174778542492860687233044979769071822630992867,1926218868760677150127639449315214888011609960023760086429726278636699417941);
        vk.IC[4] = Pairing.G1Point(21647603237455120639917065031095518831582239342589675395207972530272852501900,17203236188803932892310248923890950861152869314629976219546380361788398749428);
        vk.IC[5] = Pairing.G1Point(18551914643937927891057975350438709665637495500366639993033323611072904377990,20831576561149148009241734592357991563914903588946361390511666032075349619285);
        vk.IC[6] = Pairing.G1Point(17852618869019504694897216850103519174428933116106784875237019321357004647625,21597295344803566217562667518611988848866607096026801760563905395479662281698);
        vk.IC[7] = Pairing.G1Point(1433286479532039972558687168298899651511154665153384756792009389734452715089,12332885842455450320831265409093254424412951864544789783003886726918213030111);
        vk.IC[8] = Pairing.G1Point(15764523748280640123639073939032160827701299292792718786598549080869331763062,7336964011883534583434321938863323386844044468020075716574587585069040128828);
        vk.IC[9] = Pairing.G1Point(13331140032568396773590179743364623685362538306887090919606429892937631671112,10153360302476821337010660678498344743039888352080567328722630559518145630413);
        vk.IC[10] = Pairing.G1Point(14405010308577914890718798006244629164866410166285422973805078257723376678783,1658557937309791101583738500364390704045298462037466808864270473253764547424);
        vk.IC[11] = Pairing.G1Point(15256652137999575069807222579366479233333379937411749204684141379798148795596,18829321213251968130031048423432190477816557200873074286784617848336259657537);
        vk.IC[12] = Pairing.G1Point(7983027933540978045131212119592156434732501258419022569243111616767382593003,7872990936399993657665079767462652026865893473614634897616349558137747536866);

    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
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
    /// @return r  bool true if proof is valid
    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[12] memory input
        ) public view returns (bool r) {
        Proof memory proof;
        proof.A = Pairing.G1Point(a[0], a[1]);
        proof.B = Pairing.G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]);
        proof.C = Pairing.G1Point(c[0], c[1]);
        uint[] memory inputValues = new uint[](input.length);
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}
