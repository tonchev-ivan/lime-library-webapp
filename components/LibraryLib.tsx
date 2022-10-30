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
  const [bookName, setBookName] = useState<string>('Unknown');
  const [copies, setCopies] = useState<number | undefined>();

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

  const bookNameInput = async (input) => {
    setBookName(input.target.value);
  }

  const copiesInput = async (input) => {
    setCopies(input.target.value);
  }

  const createBook = async () => {
    loading(libraryContract.addNewBook, bookName, copies);
  }

  const changeCopies = async () => {
    loading(libraryContract.changeNumberOfBookCopies, bookId, copies);
  }

  const borrowBook = async () => {
    loading(libraryContract.borrowBook, bookId, null);
  }

  const returnBook = async () => {
    loading(libraryContract.returnBook, bookId, null);
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

  const loading = async (funcCallback, param1, param2) => {
    const errorDiv = document.querySelector<HTMLElement>('.error');
    errorDiv.style.display = 'none';
    try {
      const tx = param2 == null ? await funcCallback(param1) : await funcCallback(param1, param2);
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

      <form>
        <p>Add book:</p>
        <label>
          Book name:
          <input onChange={bookNameInput} value={bookName} type="text" name="bookName" />
        </label>
        <label>
          Book copies:
          <input onChange={copiesInput} value={copies} type="text" name="copies" />
        </label>

      </form>
      <button onClick={createBook}>Create book</button>

      <form>
        <p>Change copies:</p>
        <label>
          Book id:
          <input onChange={bookIdInput} value={bookId} type="text" name="bookId" />
        </label>
        <label>
          Book copies:
          <input onChange={copiesInput} value={copies} type="text" name="copies" />
        </label>

      </form>
      <button onClick={changeCopies}>Change copies</button>

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
