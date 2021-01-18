import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
const utils = require("ffjavascript").utils;
import { babyJub, eddsa } from 'circomlib';
const { packPoint } = babyJub;
const { verify } = eddsa;

import TextInput from '../components/TextInput';
import { Button } from '../components/Button';
import { Large } from '../components/text';

import bigInt from 'big-integer';
import mimc from '../utils/mimc';
import { generateKey, signVote } from '../utils/utils';
import { get, post } from '../utils/api';
import { proveSignature, verifyHash, verifySignature } from '../utils/prover';


const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const Poll = (props) => {
  const id = props.match.params.id;
  const [poll, setPoll] = useState(null);
  const [votes, setVotes] = useState(null);
  const [publicKey, setPublicKey] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    loadPoll();
  }, []);

  useEffect(() => {
    loadKey();
  }, [poll]);

  const loadPoll = () => {
    get(`/api/poll/${id}`, {})
    .then(data => {
      if (data.success) {
        setPoll(data.poll);
        setVotes(data.votes);
      } else {
        window.alert('Error');
      }
    });
  };

  const maxUsers = !!poll ? poll.users.length === parseInt(poll.maxUsers) : false;
  const allVoted = !!votes ? votes.ones + votes.zeros === parseInt(poll.maxUsers) : false;

  const loadKey = async () => {
    const hasVoted = localStorage.getItem(`${id}_hasvoted`);
    if (hasVoted === 'true') {
      setHasVoted(true);
    }

    const pubkeyMaybe = localStorage.getItem(`${id}_pubkey`);
    const prvkeyMaybe = localStorage.getItem(`${id}_prvkey`);
    if (pubkeyMaybe !== null && prvkeyMaybe !== null) {
      const verified = await verifyHash(pubkeyMaybe, poll);
      if (true) {
        setPublicKey(pubkeyMaybe.split(',').map(v => BigInt(v)));
        setPrivateKey(prvkeyMaybe);
      } else {
        console.log('Key is not valid');
      }
    }
  };

  const sendVote = (bit) => async () => {
    const vote = mimc(bit).toString();
    console.log(typeof publicKey[0]);
    console.log(publicKey[0]);
    const signature = signVote(privateKey, vote);
  
    const v = bigInt(parseInt(Buffer.from(vote).toString('hex'), 16));
    const ver = verify(Buffer.from(vote), signature, publicKey);
    console.log('Verified', ver);

    console.log('Vote', vote);
    console.log('Sig', signature.S);
    const s = signature.S.toString(2);
    console.log('sig', s);

    const r8 = packPoint(signature.R8);
    const r = [];
    r8.forEach(v => {
      const l = v.toString(2);
      const x = "00000000".substr(l.length) + l;
      r.push(... x.split(''));
    });
    console.log('R8', r);

    const pk = packPoint(publicKey);
    const p = [];
    pk.forEach(v => {
      const l = v.toString(2);
      const x = "00000000".substr(l.length) + l;
      p.push(... x.split(''));
    });
    console.log('pubKey', parseInt(p.join(''), 2));

    const sigProof = await proveSignature(p, publicKey[0], [mimc(publicKey[0]).toString()], r, signature.S, vote);
    
    post(`/api/polls/${id}/vote`, { vote, sigProof })
    .then(data => {
      if (data.success) {
        localStorage.setItem(`${id}_hasvoted`, 'true');
        setHasVoted(true);
      }
    });
  };

  const register = () => {
    const { publicKey, privateKey } = generateKey();
    const pubKeyHash = mimc(publicKey[0]).toString();
    post('/api/polls/register_key', { id, keyHash: pubKeyHash })
    .then(data => {
      if (data.success) {
        localStorage.setItem(`${id}_pubkey`, publicKey);
        localStorage.setItem(`${id}_prvkey`, privateKey.toString());
        setPublicKey(publicKey);
        setPrivateKey(privateKey.toString());
      }
    });
  };

  return (
    <>
      {!!poll ? 
        <Wrapper>
          <Large>{poll.title}</Large>
          <p>{poll.users.length}/{poll.maxUsers}</p>
        </Wrapper>
      : null}
      {!!publicKey ? (
        hasVoted ? (
          (allVoted) ?
            <>
              <p>Ones: {votes.ones}</p>
              <p>Zeros: {votes.zeros}</p>
            </>
          :
            <>
              <p>You have already voted</p>
            </>
        ) : (
          <>
            <p>You have a valid key</p>
            <Button onClick={sendVote(0)}>
              0
            </Button>
            <Button onClick={sendVote(1)}>
              1
            </Button>
          </>
        )
      ) : (
        maxUsers ?
          allVoted ?
            <>
              <p>Ones: {votes.ones}</p>
              <p>Zeros: {votes.zeros}</p>
            </>
          :
            <>
              <p>This poll is full, wait for the other users to vote to see the results of the poll</p>
            </>
        :
          <Button onClick={register}>
            Generate key
          </Button>
      )}
    </>
  );
}

export default Poll;
