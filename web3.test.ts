import Web3 from 'web3';
import * as ether from 'ethereumjs-tx';
const ethTx = ether.Transaction;

describe('web3 테스트코드', () => {
  let web3: Web3;
  let accounts: string[];
  let sender: string;
  let receiver: string;

  it('테스트', () => {
    console.log('hello world');
  });

  it('web3 연결테스트', () => {
    web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
  });

  // 1. 최신블럭 number 가져오기
  it('Latest Block 높이 가져오기', async () => {
    const latestBlock = await web3.eth.getBlockNumber();
    console.log(latestBlock);
  });

  it('전체 account 가져오기', async () => {
    accounts = await web3.eth.getAccounts();
    console.log(accounts);
    sender = accounts[0];
    receiver = accounts[1];
  }); // curl로 rpc 통신 시에는 객체의 result 키에 담긴 값(account[])이 바로 떨어짐.

  it('첫번째 계정 밸런스 가져오기', async () => {
    const balance: string = await web3.eth.getBalance(accounts[0]);
    console.log(Number(balance) / 10 ** 18); // 100000000000000000000 : 이더리움의 단위 중 wei로 반환, 1 ETH =  10^18 wei, 10^9 wei = 1 gwei
    // 100ETH
  });

  it('ETH 단위 변경해보기', () => {
    // ETH, gwei, wei 많이 씀
    console.log(web3.utils.toWei('1', 'gwei')); // 1000000000 (10^9)
    console.log(web3.utils.toWei('1', 'ether')); // 1000000000000000000 (10^18)
    // 소수점 처리가 어려우므로 단위를 wei로 잡아서 소수점처리의 불편함을 개선하기 위해서 이런 단위 방식을 사용함.
  });

  it('트랜잭션 횟수 구해오기', async () => {
    const txCount: number = await web3.eth.getTransactionCount(sender);
    console.log(txCount); // 0
    // 10진수 txCount를 hex로 변환해서 사용
    console.log(web3.utils.toHex(txCount)); //0x0
  });

  it('트랜잭션 실행하기', async () => {
    // 메타마스크를 사용하지 않고 nodejs 상에서 트랜잭션이 일어나도록
    const txCount: number = await web3.eth.getTransactionCount(sender);

    // 가나쉬에서 생성된 account의 privateKey값 (Sender)을 아래에 입력해준다. ❗️앞에 0x를 제외하고
    const privateKey = Buffer.from('6bc6dc9ac494f1df27e05b6e37801bb1b8c6579142471ba6a695a7ab7ed297a4', 'hex');

    // 이더리움 트랜잭션 속성
    const txObject: ether.TxData = {
      nonce: web3.utils.toHex(txCount), // 보내는 사람의 트랜잭션 수 (현재 nonce를 보내면 알아서 +1해줌)
      to: receiver,
      value: web3.utils.toHex(web3.utils.toWei('1', 'ether')), // 단위로 wei를 써야함 + hex 변환
      gasLimit: web3.utils.toHex(6721975), // 블록의 최대 가스량 (연료통이 55L) : 가나쉬 실행하면 뜸
      gasPrice: web3.utils.toHex(web3.utils.toWei('1', 'gwei')), // 가스 단위 가격 (1L 당 2000원), wei
      data: web3.utils.toHex(''), // 지금은 작성 X. 함수 호출할 때 작성 (??)
    };

    const tx = new ethTx(txObject); // tx 객체 생성
    tx.sign(privateKey); // tx 객체에 서명 추가 (return값이 void)
    console.log(tx);
    const serializedTx = tx.serialize();
    console.log(serializedTx);

    const txHash = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));
    console.log(txHash);
  });

  it('Balance 확인', async () => {
    const senderBalance: string = await web3.eth.getBalance(sender);
    const receiverBalance: string = await web3.eth.getBalance(receiver);

    console.log('sender balance : ', Number(senderBalance) / 10 ** 18);
    console.log('receiver balance : ', Number(receiverBalance) / 10 ** 18);
  }); // web3로 지갑 직접 구현이 가능해짐!

  it('gas 사용량 확인하기', async () => {
    // 가스사용량 21004 : 기본 21000 + 기본연산(balance +-) 4
    // {
    //   transactionHash: '0x65b95bc07d1e8847b8eeb32c6113cc0dbf49b9e8d21c0b4704032758ca06ddf3',
    //   transactionIndex: 0,
    //   blockHash: '0x71eb9d6914284d9cce0316dcbccb8be5239484edeea1def5d2edec0c75f2f4e9',
    //   blockNumber: 5,
    //   from: '0x0c4990165af30f3259b217082ce4ab90dfc04754',
    //   to: '0x52147030561859690cca20d92cdcd430412e5966',
    //   gasUsed: 21004,
    //   cumulativeGasUsed: 21004,
    //   contractAddress: null,
    //   logs: [],
    //   status: true,
    //   logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    // }
  });
});
