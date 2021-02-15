import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Loader from "react-loader-spinner";

import TextInput from "../components/TextInput";
import Select from "react-select";
import Spinner from "../components/Spinner";
import { Button } from "../components/Button";
import { Large } from "../components/text";

import { generateKey } from "../utils/utils";
import { proveSignature, verifyHash, verifySignature } from "../utils/prover";
import { get, post } from "../utils/api";
import { babyJub, eddsa } from "circomlib";
import { utils } from "ffjavascript";
import mimc from "../utils/mimc";
const { unpackPoint, packPoint } = babyJub;
const { verify, packSignature, sign, prv2pub } = eddsa;

const input = {
  "hashes": [
    "3348609612293587765687509817188266368296898936229175220060271913119091041533",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    "0"
  ],
  "message": "55758907973646633",
  "publicKey": [ "1", "1", "1", "0", "0", "1", "0", "1", "1", "0", "1", "0", "1", "0", "0", "0", "1", "1", "1", "0", "0", "0", "1", "1", "0", "0", "1", "1", "1", "0", "1", "1", "0", "1", "1", "1", "0", "0", "0", "1", "0", "1", "1", "1", "0", "0", "1", "1", "0", "1", "1", "0", "1", "0", "1", "0", "0", "0", "1", "1", "1", "1", "1", "0", "1", "1", "0", "0", "0", "0", "0", "0", "1", "1", "1", "1", "0", "1", "0", "0", "0", "1", "1", "1", "1", "0", "0", "1", "0", "0", "1", "0", "1", "1", "0", "0", "1", "1", "0", "1", "0", "1", "1", "0", "1", "0", "1", "1", "0", "1", "0", "0", "1", "0", "0", "0", "1", "0", "1", "1", "0", "1", "1", "1", "1", "0", "1", "0", "1", "1", "1", "1", "0", "0", "1", "0", "0", "1", "1", "0", "0", "1", "1", "1", "0", "1", "1", "1", "0", "0", "1", "1", "1", "1", "0", "0", "1", "1", "1", "1", "0", "1", "0", "0", "0", "0", "1", "1", "1", "0", "1", "1", "0", "0", "0", "1", "1", "1", "0", "0", "0", "1", "1", "0", "1", "1", "0", "0", "1", "1", "1", "0", "1", "1", "0", "1", "0", "0", "1", "1", "0", "0", "1", "1", "1", "1", "1", "1", "0", "0", "1", "1", "0", "1", "0", "0", "0", "0", "1", "1", "0", "0", "1", "0", "0", "0", "0", "0", "0", "0", "1", "1", "0", "1", "1", "1", "1", "0", "1", "0", "0", "0", "0", "1", "1", "0", "0", "1", "0", "1", "1", "1", "1", "0", "0", "0" ],
  "sigR8": [ "1", "0", "0", "1", "1", "1", "0", "1", "0", "0", "1", "1", "0", "0", "1", "1", "0", "0", "1", "0", "0", "0", "1", "0", "0", "0", "1", "0", "1", "1", "1", "1", "1", "1", "0", "0", "1", "1", "1", "0", "1", "1", "1", "1", "0", "0", "0", "1", "1", "1", "0", "1", "0", "1", "0", "1", "0", "0", "1", "1", "0", "1", "1", "0", "0", "1", "1", "1", "1", "0", "0", "1", "0", "1", "0", "1", "1", "1", "1", "1", "1", "1", "1", "1", "0", "1", "1", "1", "0", "0", "1", "0", "1", "0", "1", "0", "1", "0", "1", "1", "0", "1", "1", "1", "0", "0", "0", "1", "1", "0", "0", "0", "1", "1", "1", "0", "1", "0", "1", "1", "0", "1", "0", "0", "0", "0", "1", "0", "0", "1", "0", "1", "1", "1", "1", "1", "0", "1", "1", "0", "1", "1", "0", "0", "1", "1", "1", "1", "1", "1", "1", "1", "0", "0", "0", "0", "1", "1", "1", "1", "0", "0", "0", "0", "0", "1", "0", "1", "1", "1", "1", "1", "0", "0", "1", "0", "0", "0", "1", "1", "1", "0", "0", "1", "1", "1", "0", "1", "1", "1", "0", "1", "1", "1", "1", "1", "0", "0", "0", "0", "1", "0", "0", "0", "0", "1", "0", "1", "1", "1", "0", "0", "1", "0", "1", "1", "1", "0", "1", "0", "1", "0", "0", "1", "0", "1", "1", "1", "0", "0", "0", "0", "0", "1", "1", "0", "0", "0", "0", "0", "1", "0", "1", "1", "0", "1", "0", "1", "0", "1", "1", "1", "0", "1", "0", "1" ],
  "sigR8Halves": [
    "88845897127581296682441180401577020601",
    "232184061473122894577264247195352119034"
  ],
  "sigS": "1505483150364971029328164430759254544875316277623937245414367601338929550068"
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const Spacer = styled.div`
  height: 30px;
`;

const Header = styled.p`
  width: 100px;
  padding-left: 5px;
`;

const SelectGroup = styled(Select)`
  width: 100%;
  height: 10%;
`;

const MessageInput = styled(TextInput)`
  display: flex;
  width: 100%;
  height: 10%;
  margin-left: 45%;
  margin-right: 45%;
  margin-top: 20%;
  margin-bottom: 70%;
`;

const NewConfession = (props) => {
  const [group, setGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [message, setMessage] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [loading, setLoading] = useState(false);

  const [passwordHash, setPasswordHash] = useState(null);

  useEffect(() => {
    loadGroups();
  }, []);
  useEffect(() => {
    loadKeys();
  }, [group]);

  const loadGroups = async () => {
    const groupsMaybe = localStorage.getItem(`groups`);
    if (groupsMaybe !== null) {
      if (true) {
        setGroups(groupsMaybe.split(","));
        setGroup(groupsMaybe.split(",")[0]);
      } else {
        console.log("You are not a member of any group");
      }
    }
  };
  const loadKeys = async () => {
    const publicKeyMaybe = localStorage.getItem(`${group}_publicKey`);
    const privateKeyMaybe = localStorage.getItem(`${group}_privateKey`);
    if (publicKeyMaybe !== null && privateKeyMaybe !== null) {
      if (true) {
        setPublicKey(publicKeyMaybe.split(",").map((v) => BigInt(v)));
        setPrivateKey(privateKeyMaybe);
      } else {
        console.log("Key is not valid");
      }
    }
  };

  function buffer2bits(buff) {
    const res = [];
    for (let i = 0; i < buff.length; i++) {
      for (let j = 0; j < 8; j++) {
        if ((buff[i] >> j) & 1) {
          res.push("1");
        } else {
          res.push("0");
        }
      }
    }
    return res;
  }

  function printJSONWithBigints(input: Object) {
    return JSON.parse(
      JSON.stringify(
        input,
        (key, value) =>
          typeof value === "bigint"
            ? value.toString()
            : Array.isArray(value)
            ? '["' + value.join('","') + '"]'
            : value // return everything else unchanged
      )
    );
  }

  const create = async () => {
    setLoading(true);

    const msgBuff = Buffer.from(message);
    const messageBits = buffer2bits(msgBuff);
    var messageHash = BigInt(mimc(...messageBits)).toString(16);
    if (messageHash.length % 2) {
      messageHash = "0" + messageHash;
    }
    const msg = Buffer.from(messageHash, "hex");

    const pPublicKey = packPoint(publicKey);

    const signature = sign(privateKey, msg);
    const pSignature = packSignature(signature);

    const aBits = buffer2bits(pPublicKey);
    const rBits = buffer2bits(pSignature.slice(0, 32));
    const rBits1 = buffer2bits(pSignature.slice(0,16));
    const rBits2 = buffer2bits(pSignature.slice(16));
    const sBits = buffer2bits(pSignature.slice(32, 64));
    const msgBits = buffer2bits(msg);
    //const a = utils.leBuff2int(pPublicKey);
    const r = utils.leBuff2int(pSignature.slice(0,32));
    const r1 = utils.leBuff2int(pSignature.slice(0,16));
    const r2 = utils.leBuff2int(pSignature.slice(16));
    const s = utils.leBuff2int(pSignature.slice(32,64));
    const m = utils.leBuff2int(msg);
    const r8half1 = utils.leBuff2int(pSignature.slice(0, 16));
    const r8half2 = utils.leBuff2int(pSignature.slice(16, 32));
    const r8halves = [r8half1, r8half2];

    get(`/api/groups/${group}`, {}).then(async (data) => {
      if (data.success) {
        const input1 = {
          publicKey: aBits,
          hashes: data.hashes,
          sigR8: rBits,
          sigR8Halves: [r8half1, r8half2],
          sigS: s.toString(),
          message: m.toString(),
        };
        console.log(input1);
        const proof = await proveSignature(
          aBits,
          data.hashes,
          rBits,
          r8halves,
          s,
          m
        );
        /*
        const proof = await proveSignature(
          input.publicKey,
          input.hashes,
          input.sigR8,
          input.sigR8Halves,
          input.sigS,
          input.message
        );
        */
        const verified = await verifySignature(proof);
        if (verified) {
          console.log('Valid Proof');
        } else {
          console.log('Invalid Proof');
        }

        post("/api/confessions/post", { message, proof, group }).then(
          (data) => {
            if (data.success) {
              props.history.push("/confessions");
            } else {
              console.log(data.error);
            }
            setLoading(false);
          }
        );
      } else {
        console.log(data.error);
      }
      setLoading(false);
    });
  };

  const onChange = (stateSetter) => (value) => {
    stateSetter(value);
  };

  const onChangeGroup = ({ value, label }) => {
    setGroup(value);
  };

  return (
    <>
      {!loading ? (
        <>
          <Large>Post confession</Large>
          <Wrapper>
            <Header>Group</Header>
            <SelectGroup
              options={groups.map((group) => {
                return { value: group, label: group };
              })}
              onChange={onChangeGroup}
            />
          </Wrapper>
          <Wrapper>
            <Header>Confession</Header>
            <MessageInput
              placeholder={null}
              onChange={onChange(setMessage)}
              value={message}
            />
          </Wrapper>
          <Button onClick={create}>Post</Button>
        </>
      ) : (
        <Spinner />
      )}
    </>
  );
};

export default NewConfession;
