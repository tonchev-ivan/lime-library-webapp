import type { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { useEffect, useState } from "react";
import useLibraryContract from "../hooks/useLibraryContract";

type LibraryContract = {
  contractAddress: string;
};

const BOOK_STATE = {
  '-1': 'Not Borrowed',
  '0': 'Borrowed',
  '1': 'Returned'
}

const LibraryLib = ({ contractAddress }: LibraryContract) => {
  const { account, library } = useWeb3React<Web3Provider>();
  const libraryContract = useLibraryContract(contractAddress);
  const [availableBooks, setAvailableBooks] = useState<string>('Unknown');
  const [bookId, setBookId] = useState<number | undefined>();

  useEffect(() => {
    resetForm();
  }, [])

  const getAvailableBooks = async () => {
    const test = await libraryContract.getAvailableBooks();
    console.log(test.toString());
    setAvailableBooks((await libraryContract.getAvailableBooks()).toString());
  }

  const bookIdInput = async (input) => {
    setBookId(input.target.value);
  }

  const borrowBook = async () => {
    loading(bookId, libraryContract.borrowBook);
  }

  const returnBook = async () => {
    loading(bookId, libraryContract.returnBook);
  }

  const checkBorrowState = async () => {
    const state = await libraryContract.getBookBorrowerState(bookId);
    const information = document.querySelector<HTMLElement>('.information');
    information.innerHTML = BOOK_STATE[state.toString()];
  }

  const checkAvailableCopies = async () => {
    showInformation(bookId, libraryContract.getBookAvailableCopies, "Available copies: ");
  }

  const showAllBookBorrowers = async () => {
    showInformation(bookId, libraryContract.getBookBorrowers, "All borrowers: ");
  }

  const showInformation = async (bookId, funcCallback, text) => {
    const information = document.querySelector<HTMLElement>('.information');
    information.innerHTML = text + (await funcCallback(bookId)).toString();
  }

  const loading = async (bookId, funcCallback) => {
    const errorDiv = document.querySelector<HTMLElement>('.error');
    errorDiv.style.display = 'none';
    try {
      const tx = await funcCallback(bookId);
      const txHash = tx.hash;
      const loadingElement = document.querySelector<HTMLElement>('.loading');
      loadingElement.style.display = 'block';
      const hashDisplay = document.querySelector<HTMLAnchorElement>('.trxHash');
      hashDisplay.innerHTML = txHash;
      hashDisplay.href = `https://goerli.etherscan.io/tx/${txHash}`;
      await tx.wait();
      loadingElement.style.display = 'none';
      hashDisplay.innerHTML = '';
    } catch (error) {
      console.log(error.message)
      errorDiv.style.display = 'block';
      const errorMsg = document.querySelector<HTMLElement>('.error-message');
      errorMsg.innerHTML = await error.message;
    } finally {
      resetForm();
    }
  }

  const resetForm = async () => {
    setBookId(undefined);
    getAvailableBooks();
  }

  return (
    <div className="results-form">
      <p>
        Available books by id: [{availableBooks}]
      </p>
      <form>
        <p>Book Action</p>
        <label>
          Book id:
          <input onChange={bookIdInput} value={bookId} type="text" name="bookId" />
        </label>
      </form>
      <button onClick={borrowBook}>Borrow book</button>
      <button onClick={returnBook}>Return book</button>
      <button onClick={checkBorrowState}>Check borrow state</button>
      <button onClick={checkAvailableCopies}>Check available copies</button>
      <button onClick={showAllBookBorrowers}>Show borrowers history</button>
      <p className='information'></p>

      <div className="error">
        <p className="error-message"></p>
      </div>
      <div className="loading">
        <a className="trxHash"></a>
      </div>
      <style jsx>{`
        .loading {
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 100;
          width: 100vw;
          height: 100vh;
          background-color: rgba(192, 192, 192, 0.5);
          background-image: url("https://i.stack.imgur.com/MnyxU.gif");
          background-repeat: no-repeat;
          background-position: center;
        }

        .trxHash {
          animation: blinker 1s linear infinite;
          background-color: rgb(0, 0, 255, 0.5);
        }

        @keyframes blinker {
          50% {
            opacity: 0;
          }
        }

        .error {
          background-color: red;
          display: none;
        }
      `}</style>
    </div>
  );
};

export default LibraryLib;
