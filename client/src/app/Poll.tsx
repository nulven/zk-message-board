import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
const utils = require("ffjavascript").utils;
import { babyJub, eddsa } from 'circomlib';
const { packPoint } = babyJub;
const { verify, packSignature, sign } = eddsa;
import Loader from 'react-loader-spinner';

import TextInput from '../components/TextInput';
import { Button } from '../components/Button';
import { Large } from '../components/text';

import bigInt from 'big-integer';
import mimc from '../utils/mimc';
import { generateKey } from '../utils/utils';
import { get, post } from '../utils/api';
import { proveSignature, verifyHash, verifySignature } from '../utils/prover';


const SpinnerWrapper = styled.div`
  display: flex;
  width: 10%;
  height: 10%;
  margin-left: 45%;
  margin-right: 45%;
  margin-top: 20%;
  margin-bottom: 70%;
`;

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
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadPoll();
  }, []);

  useEffect(() => {
    loadKey();
  }, [poll]);

  const loadPoll = () => {
    get(`/api/polls/${id}`, {})
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

  const generate = !hasVoted && !maxUsers && !publicKey;
  const waiting = hasVoted && !allVoted;
  const waitingNotRegistered = maxUsers && !allVoted && !publicKey;
  const voting = !hasVoted && !!publicKey;
  const tally = allVoted && (hasVoted || maxUsers);

  const loadKey = async () => {
    const hasVoted = localStorage.getItem(`${id}_hasvoted`);
    if (hasVoted === 'true') {
      setHasVoted(true);
    }

    const pubkeyMaybe = localStorage.getItem(`${id}_pubkey`);
    const prvkeyMaybe = localStorage.getItem(`${id}_prvkey`);
    if (pubkeyMaybe !== null && prvkeyMaybe !== null) {
      //const verified = await verifyHash(pubkeyMaybe, poll);
      if (true) {
        setPublicKey(pubkeyMaybe.split(',').map(v => BigInt(v)));
        setPrivateKey(prvkeyMaybe);
      } else {
        console.log('Key is not valid');
      }
    }
  };

  function buffer2bits(buff) {
    const res = [];
    for (let i = 0; i < buff.length; i++) {
      for (let j = 0; j < 8; j++) {
        if ((buff[i] >> j) & 1) {
          res.push('1');
        } else {
          res.push('0');
        }
      }
    }
    return res;
  }

  const sendVote = (bit) => async () => {
    setSending(true);
    const vote = mimc(bit).toString().padStart(78, '0');
    const msg = Buffer.from(vote, 'hex');
    const pPubKey = packPoint(publicKey);
    const signature = sign(privateKey, msg);
    const pSignature = packSignature(signature);

    const msgBits = buffer2bits(msg);
    const rBits = buffer2bits(pSignature.slice(0, 32));
    const sBits = buffer2bits(pSignature.slice(32, 64));
    const aBits = buffer2bits(pPubKey);

    const hash = mimc(...aBits).toString();
  
    const sigProof = await proveSignature(aBits, poll.users, [rBits, sBits], msgBits);
 
    post(`/api/polls/${id}/vote`, { sigProof })
    .then(data => {
      if (data.success) {
        localStorage.setItem(`${id}_hasvoted`, 'true');
        setHasVoted(true);
      } else {
        console.log(data.error);
      }
      setSending(false);
    });
  };

  const Spinner = () => {
    return (
      <SpinnerWrapper>
        <Loader type="Oval" />
      </SpinnerWrapper>
    );
  };

  const Tally = () => {
    return (
      <>
        <p>Ones: {votes.ones}</p>
        <p>Zeros: {votes.zeros}</p>
      </>
    );
  };

  const Voting = () => {
    return (
      <>
        <p>You have a valid key</p>
        <Button onClick={sendVote(0)}>
          0
        </Button>
        <Button onClick={sendVote(1)}>
          1
        </Button>
      </>
    );
  };

  const register = () => {
    const { publicKey, privateKey } = generateKey();
    const pPubKey = packPoint(publicKey);
    const pubKeyBits = buffer2bits(pPubKey);
    const pubKeyHash = mimc(...pubKeyBits).toString();
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
      {!sending ?
        <>
          {generate ? 
            <Button onClick={register}>
              Generate key
            </Button>
          : null}
          {tally ? <Tally /> : null}
          {voting ? <Voting /> : null}
          {waiting ? <p>You have already voted</p> : null}
          {waitingNotRegistered ?
            <p>This poll is full, wait for the other users to vote to see the results of the poll</p>
          : null}
        </>
      : <Spinner />}
    </>
  );
}

export default Poll;
