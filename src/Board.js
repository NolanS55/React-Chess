import './index.css'
import wPawn from './icons/wPawn.png'
import wKnight from './icons/wKnight.png'
import wBishop from './icons/wBishop.png'
import wRook from './icons/wRook.png'
import wQueen from './icons/wQueen.png'
import wKing from './icons/wKing.png'
import bPawn from './icons/bPawn.png'
import bKnight from './icons/bKnight.png'
import bBishop from './icons/bBishop.png'
import bRook from './icons/bRook.png'
import bQueen from './icons/bQueen.png'
import bKing from './icons/bKing.png'
import moveSound from './sounds/move.wav'
import checkSound from './sounds/check.wav'

import { useState, useEffect } from 'react'
import { render } from '@testing-library/react'
import { typeImplementation } from '@testing-library/user-event/dist/type/typeImplementation'

const pawn = {
    value : 1,
    firstMove: true,
    enpasent: false,
    move : function(oldPos, newPos, board) { 
        if((board[oldPos].side === 'w' && newPos > oldPos) || (board[oldPos].side === 'b' && newPos < oldPos)) {//makes sure piece is moving in the correct direction
            return false;
        }
        let dif = newPos - oldPos;
        if(dif < 0) {
            dif = dif * -1
        }
        if(((dif === 16 && this.firstMove === true && board[newPos].piece === null) || (dif === 8)) && board[newPos].piece === null) {//checks for piece moving foward
            this.enpasent = false;
            if(dif === 16) {//makes it so enpasent is possible
                this.enpasent = true
            }
            this.firstMove = false;
            return true;
        }
        if(((dif === 9 && oldPos % 8 != 0) || (dif === 7 && oldPos % 8 != 1)) && ((board[newPos].side != null))) {//capture check
            return true;
        }
        
        if(board[oldPos].side === 'b') {
            if((dif === 9  || dif === 7) && ((board[newPos - 8].side != null) && (board[newPos - 8].piece.value === 1))) {//capture check
                if(board[newPos - 8].piece.enpasent) {
                    board[newPos - 8] = {piece : null, icon : "", id : newPos - 7, side : null, highlight : false}
                    return true
                }
            }
        }
        else if(board[oldPos].side === 'w') {
            if((dif === 9  || dif === 7) && ((board[newPos  + 8].side != null) && (board[newPos + 8].piece.value === 1))) {
                if(board[newPos + 8].piece.enpasent) {
                    board[newPos + 8] = {piece : null, icon : "", id : newPos  + 9, side : null, highlight : false}
                    return true
                }
            }
        }
        
        return false
    }
}

const knight = {
    value: 3,
    move : function(oldPos, newPos, board) {//messy fix it later
        if((oldPos + 1) % 8 != 0) {
            if((oldPos - 15 === newPos) || (oldPos + 17 === newPos)) {
                return true
            }
        }
        if((oldPos) % 8 != 0) {
            if((oldPos - 17 === newPos) || (oldPos + 15 === newPos)) {
                return true
            }
        }
        if(((oldPos + 1) % 8 != 0) && ((oldPos + 2) % 8 != 0)) {
            if(((oldPos + 2) + 8 === newPos) || (oldPos - 6 === newPos)) {
                return true
            }
        }
        if(((oldPos - 1) % 8 != 0) && (oldPos % 8 != 0)) {
            if(((oldPos + 6) === newPos) || (oldPos - 10 === newPos)) {
                return true
            }
        }
        return false
    }
}

const bishop = {
    value : 30,
    move : function(oldPos, newPos, board) {
        //crate own rows using - 8 from value and check if value is less or greater then that
        let row = oldPos;
        if(row % 8 > ((newPos) % 8)) {
            if(oldPos > newPos) {
                for(let i = oldPos - 9; i >= newPos; i -= 9) {
                    if(i === newPos) {
                        return true
                    }
                    if(board[i].piece != null) {
                        return false
                    }
                }
            }
            else if(newPos > oldPos) {
                for(let i = oldPos + 7; i <= newPos; i += 7) {
                    if(i === newPos) {
                        return true
                    }
                    if(board[i].piece != null) {
                        return false
                    }
                }
            }
        }
        else if(row % 8 < ((newPos) % 8)) {
            if(newPos > oldPos) {
                for(let i = oldPos + 9; i <= newPos; i += 9) {
                    if(i === newPos) {
                        return true
                    }
                    if(board[i].piece != null) {
                        return false
                    }
                }
            }
            else if(oldPos > newPos) {
                for(let i = oldPos - 7; i >= newPos; i -= 7) {
                    if(i === newPos) {
                        return true
                    }
                    if(board[i].piece != null) {
                        return false
                    }
                }
            }
        }
        return false
    }
}

const rook = {
    value : 5,
    canCastle : true,
    move : function(oldPos, newPos, board) {
        let dif = newPos - oldPos;//temporary converts units to positive to see if piece is moving correctly
        if(dif < 0) {
            dif = dif * -1
        }
        let leftRow = oldPos - (oldPos % 8)
        let rightRow = oldPos + (8 - (oldPos % 8))
        if((oldPos % 8 === newPos % 8) || (newPos >= leftRow && newPos < rightRow)) {//(dif < 7 || dif % 8 == 0) || (dif === 7 && (((oldPos + 1) % 8 === 0 && (newPos + 1) % 8 === 1) || ((newPos + 1) % 8 === 0 && (oldPos + 1) % 8 === 1)))) {//This is so messy but it works: FIX LATER-Bro it dont even work
            let start = Math.min(newPos, oldPos)
            let end = Math.max(newPos, oldPos)
            if(dif < 8) {
                if(board.slice(start + 1, end).filter((tile)  => tile.piece != null).length != 0) {
                    return false
                }
            }
            else if(dif > 8) {
                //always start with lowest
                for(let i = start + 8; i != end; i += 8) {
                    if(board[i].piece != null) {
                        return false
                    }
                }
            }
            this.canCastle = false
            return true
        }
    }
}

const queen = {
    value: 9,
    move : function(oldPos, newPos, board) {

        let dif = newPos - oldPos;//temporary converts units to positive to see if piece is moving correctly
        if(dif < 0) {
            dif = dif * -1
        }
        let leftRow = oldPos - (oldPos % 8)
        let rightRow = oldPos + (8 - (oldPos % 8))
        if((oldPos % 8 === newPos % 8) || (newPos >= leftRow && newPos < rightRow)) {//(dif < 7 || dif % 8 == 0) || (dif === 7 && (((oldPos + 1) % 8 === 0 && (newPos + 1) % 8 === 1) || ((newPos + 1) % 8 === 0 && (oldPos + 1) % 8 === 1)))) {//This is so messy but it works: FIX LATER-Bro it dont even work
            let start = Math.min(newPos, oldPos)
            let end = Math.max(newPos, oldPos)
            if(dif < 8) {
                if(board.slice(start + 1, end).filter((tile)  => tile.piece != null).length != 0) {
                    return false
                }
            }
            else if(dif > 8) {
                //always start with lowest
                for(let i = start + 8; i != end; i += 8) {
                    if(board[i].piece != null) {
                        return false
                    }
                }
            }
            this.canCastle = false
            return true
        }
        let row = oldPos
        if(row % 8 > (newPos % 8)) {
            if(oldPos > newPos) {
                for(let i = oldPos - 9; i >= newPos; i -= 9) {
                    if(i === newPos) {
                        return true
                    }
                    if(board[i].piece != null) {
                        return false
                    }
                }
            }
            else if(newPos > oldPos) {
                for(let i = oldPos + 7; i <= newPos; i += 7) {
                    if(i === newPos) {
                        return true
                    }
                    if(board[i].piece != null) {
                        return false
                    }
                }
            }
        }
        else if(row % 8 < (newPos % 8)) {
            if(newPos > oldPos) {
                for(let i = oldPos + 9; i <= newPos; i += 9) {
                    if(i === newPos) {
                        return true
                    }
                    if(board[i].piece != null) {
                        return false
                    }
                }
            }
            else if(oldPos > newPos) {
                for(let i = oldPos - 7; i >= newPos; i -= 7) {
                    if(i === newPos) {
                        return true
                    }
                    if(board[i].piece != null) {
                        return false
                    }
                }
            }
        }
        return false
    }
}

const king = {
    value: 11,
    checked: false,
    canCastle: true,
    move: function(oldPos, newPos,  board) {
        let dif = newPos - oldPos;//temporary converts units to positive to see if piece is moving correctly
        if(dif < 0) {
            dif = dif * -1
        }
        if(dif === 1 || dif === 7 || dif === 9 || dif === 8) {
            return true
        }
    },
    inCheck :  function(side, opposing, board) {
        
        let kingPos = board.filter((tile) => (tile.side === side && tile.piece.value === 11))[0].id - 1
        for(let i = 0; i < 64; i++) {
            
            if(board[i].piece != null && board[i].side === opposing) {
                
                
                if(board[i].piece.move(i , kingPos, board)) {
                    
                    this.checked = true;
                    return true
                }
            }
        }
        
        this.checked = false
        return false
        
        

    }
}

var turn = 'w'
var waiting = 'b'
var primary = -1;
var holdPawn = -1
var count = 0
const Board = () => {
    var colorOne = '#50af6e'
    var colorTwo = '#af5091'
    var colourHold = ''
    
    const [board, setBoard] = useState([{piece : Object.create(rook), icon : bRook, id : 1, side : 'b', higlight : false}, {piece : Object.create(knight), icon : bKnight, id : 2, side : 'b', higlight : false}, {piece : Object.create(bishop), icon : bBishop, id : 3, side : 'b', higlight : false}, {piece : Object.create(queen), icon : bQueen, id : 4, side : 'b', higlight : false}, {piece : Object.create(king), icon : bKing, id : 5, side : 'b', higlight : false}, {piece : Object.create(bishop), icon : bBishop, id : 6, side : 'b', higlight : false}, {piece : Object.create(knight), icon : bKnight, id : 7, side : 'b', higlight : false}, {piece : Object.create(rook), icon : bRook, id : 8, side : 'b', higlight : false},
                                        {piece : Object.create(pawn), icon : bPawn, id : 9, side : 'b', highlight : false}, {piece : Object.create(pawn), icon : bPawn, id : 10, side : 'b', highlight : false}, {piece : Object.create(pawn), icon : bPawn, id : 11, side : 'b', highlight : false}, {piece : Object.create(pawn), icon : bPawn, id : 12, side : 'b', highlight : false}, {piece : Object.create(pawn), icon : bPawn, id : 13, side : 'b', highlight : false}, {piece : Object.create(pawn), icon : bPawn, id : 14, side : 'b', highlight : false}, {piece : Object.create(pawn), icon : bPawn, id : 15, side : 'b', highlight : false}, {piece : Object.create(pawn), icon : bPawn, id : 16, side : 'b', highlight : false},
                                        {piece : null, icon : "", id : 17, side : null, highlight : false}, {piece : null, icon : "", id : 18, side : null, highlight : false}, {piece : null, icon : "", id : 19, side : null, highlight : false}, {piece : null, icon : "", id : 20, side : null, highlight : false}, {piece : null, icon : "", id : 21, side : null, highlight : false}, {piece : null, icon : "", id : 22, side : null, highlight : false}, {piece : null, icon : "", id : 23, side : null, highlight : false}, {piece : null, icon : "", id : 24, side : null, highlight : false},
                                        {piece : null, icon : "", id : 25, side : null, highlight : false}, {piece : null, icon : "", id : 26, side : null, highlight : false}, {piece : null, icon : "", id : 27, side : null, highlight : false}, {piece : null, icon : "", id : 28, side : null, highlight : false}, {piece : null, icon : "", id : 29, side : null, highlight : false}, {piece : null, icon : "", id : 30, side : null, highlight : false}, {piece : null, icon : "", id : 31, side : null, highlight : false}, {piece : null, icon : "", id : 32, side : null, highlight : false},
                                        {piece : null, icon : "", id : 33, side : null, highlight : false}, {piece : null, icon : "", id : 34, side : null, highlight : false}, {piece : null, icon : "", id : 35, side : null, highlight : false}, {piece : null, icon : "", id : 36, side : null, highlight : false}, {piece : null, icon : "", id : 37, side : null, highlight : false}, {piece : null, icon : "", id : 38, side : null, highlight : false}, {piece : null, icon : "", id : 39, side : null, highlight : false}, {piece : null, icon : "", id : 40, side : null, highlight : false},
                                        {piece : null, icon : "", id : 41, side : null, highlight : false}, {piece : null, icon : "", id : 42, side : null, highlight : false}, {piece : null, icon : "", id : 43, side : null, highlight : false}, {piece : null, icon : "", id : 44, side : null, highlight : false}, {piece : null, icon : "", id : 45, side : null, highlight : false}, {piece : null, icon : "", id : 46, side : null, highlight : false}, {piece : null, icon : "", id : 47, side : null, highlight : false}, {piece : null, icon : "", id : 48, side : null, highlight : false},
                                        {piece : Object.create(pawn), icon : wPawn, id : 49, side : 'w', highlight : false}, {piece : Object.create(pawn), icon : wPawn, id : 50, side : 'w', highlight : false}, {piece : Object.create(pawn), icon : wPawn, id : 51, side : 'w', highlight : false}, {piece : Object.create(pawn), icon : wPawn, id : 52, side : 'w', highlight : false}, {piece : Object.create(pawn), icon : wPawn, id : 53, side : 'w', highlight : false}, {piece : Object.create(pawn), icon : wPawn, id : 54, side : 'w', highlight : false}, {piece : Object.create(pawn), icon : wPawn, id : 55, side : 'w', highlight : false}, {piece : Object.create(pawn), icon : wPawn, id : 56, side : 'w', highlight : false},
                                        {piece : Object.create(rook), icon : wRook, id : 57, side : 'w', higlight : false}, {piece : Object.create(knight), icon : wKnight, id : 58, side : 'w', higlight : false}, {piece : Object.create(bishop), icon : wBishop, id : 59, side : 'w', higlight : false}, {piece : Object.create(queen), icon : wQueen, id : 60, side : 'w', higlight : false}, {piece : Object.create(king), icon : wKing, id : 61, side : 'w', higlight : false}, {piece : Object.create(bishop), icon : wBishop, id : 62, side : 'w', higlight : false}, {piece : Object.create(knight), icon : wKnight, id : 63, side : 'w', higlight : false}, {piece : Object.create(rook), icon : wRook, id : 64, side : 'w', higlight : false},
                                        ]) 
    const resetGame = () => {
        setBoard([{piece : Object.create(rook), icon : bRook, id : 1, side : 'b', higlight : false}, {piece : Object.create(knight), icon : bKnight, id : 2, side : 'b', higlight : false}, {piece : Object.create(bishop), icon : bBishop, id : 3, side : 'b', higlight : false}, {piece : Object.create(queen), icon : bQueen, id : 4, side : 'b', higlight : false}, {piece : Object.create(king), icon : bKing, id : 5, side : 'b', higlight : false}, {piece : Object.create(bishop), icon : bBishop, id : 6, side : 'b', higlight : false}, {piece : Object.create(knight), icon : bKnight, id : 7, side : 'b', higlight : false}, {piece : Object.create(rook), icon : bRook, id : 8, side : 'b', higlight : false},
        {piece : Object.create(pawn), icon : bPawn, id : 9, side : 'b', highlight : false}, {piece : Object.create(pawn), icon : bPawn, id : 10, side : 'b', highlight : false}, {piece : Object.create(pawn), icon : bPawn, id : 11, side : 'b', highlight : false}, {piece : Object.create(pawn), icon : bPawn, id : 12, side : 'b', highlight : false}, {piece : Object.create(pawn), icon : bPawn, id : 13, side : 'b', highlight : false}, {piece : Object.create(pawn), icon : bPawn, id : 14, side : 'b', highlight : false}, {piece : Object.create(pawn), icon : bPawn, id : 15, side : 'b', highlight : false}, {piece : Object.create(pawn), icon : bPawn, id : 16, side : 'b', highlight : false},
        {piece : null, icon : "", id : 17, side : null, highlight : false}, {piece : null, icon : "", id : 18, side : null, highlight : false}, {piece : null, icon : "", id : 19, side : null, highlight : false}, {piece : null, icon : "", id : 20, side : null, highlight : false}, {piece : null, icon : "", id : 21, side : null, highlight : false}, {piece : null, icon : "", id : 22, side : null, highlight : false}, {piece : null, icon : "", id : 23, side : null, highlight : false}, {piece : null, icon : "", id : 24, side : null, highlight : false},
        {piece : null, icon : "", id : 25, side : null, highlight : false}, {piece : null, icon : "", id : 26, side : null, highlight : false}, {piece : null, icon : "", id : 27, side : null, highlight : false}, {piece : null, icon : "", id : 28, side : null, highlight : false}, {piece : null, icon : "", id : 29, side : null, highlight : false}, {piece : null, icon : "", id : 30, side : null, highlight : false}, {piece : null, icon : "", id : 31, side : null, highlight : false}, {piece : null, icon : "", id : 32, side : null, highlight : false},
        {piece : null, icon : "", id : 33, side : null, highlight : false}, {piece : null, icon : "", id : 34, side : null, highlight : false}, {piece : null, icon : "", id : 35, side : null, highlight : false}, {piece : null, icon : "", id : 36, side : null, highlight : false}, {piece : null, icon : "", id : 37, side : null, highlight : false}, {piece : null, icon : "", id : 38, side : null, highlight : false}, {piece : null, icon : "", id : 39, side : null, highlight : false}, {piece : null, icon : "", id : 40, side : null, highlight : false},
        {piece : null, icon : "", id : 41, side : null, highlight : false}, {piece : null, icon : "", id : 42, side : null, highlight : false}, {piece : null, icon : "", id : 43, side : null, highlight : false}, {piece : null, icon : "", id : 44, side : null, highlight : false}, {piece : null, icon : "", id : 45, side : null, highlight : false}, {piece : null, icon : "", id : 46, side : null, highlight : false}, {piece : null, icon : "", id : 47, side : null, highlight : false}, {piece : null, icon : "", id : 48, side : null, highlight : false},
        {piece : Object.create(pawn), icon : wPawn, id : 49, side : 'w', highlight : false}, {piece : Object.create(pawn), icon : wPawn, id : 50, side : 'w', highlight : false}, {piece : Object.create(pawn), icon : wPawn, id : 51, side : 'w', highlight : false}, {piece : Object.create(pawn), icon : wPawn, id : 52, side : 'w', highlight : false}, {piece : Object.create(pawn), icon : wPawn, id : 53, side : 'w', highlight : false}, {piece : Object.create(pawn), icon : wPawn, id : 54, side : 'w', highlight : false}, {piece : Object.create(pawn), icon : wPawn, id : 55, side : 'w', highlight : false}, {piece : Object.create(pawn), icon : wPawn, id : 56, side : 'w', highlight : false},
        {piece : Object.create(rook), icon : wRook, id : 57, side : 'w', higlight : false}, {piece : Object.create(knight), icon : wKnight, id : 58, side : 'w', higlight : false}, {piece : Object.create(bishop), icon : wBishop, id : 59, side : 'w', higlight : false}, {piece : Object.create(queen), icon : wQueen, id : 60, side : 'w', higlight : false}, {piece : Object.create(king), icon : wKing, id : 61, side : 'w', higlight : false}, {piece : Object.create(bishop), icon : wBishop, id : 62, side : 'w', higlight : false}, {piece : Object.create(knight), icon : wKnight, id : 63, side : 'w', higlight : false}, {piece : Object.create(rook), icon : wRook, id : 64, side : 'w', higlight : false},
        ])
    }
    
    const checkMated = () => {
        let mateBoard = [...board]
        let curKing = board.filter((tile) => (tile.side === turn && tile.piece.value === 11))[0]
        if(curKing.piece.inCheck(turn, waiting, board)) {
            for(let i = 0; i < 64; i++) {//horibly optimized, find a better way to do it
                if(mateBoard[i].side === turn) {
                    for(let j = 0; j < 64; j++) {
                        if(mateBoard[j].side !== turn) {
                            if(board[i].piece.move(i, j, mateBoard)) {
                                mateBoard[j] = {...board[i]}
                                mateBoard[j].id = j + 1;
                                mateBoard[j].highlight = false
                                mateBoard[i] = {piece : null, icon : "", id : i + 1, side : null, highlight : false}
                                console.log(mateBoard, mateBoard.filter((tile) => (tile.side === turn && tile.piece.value === 11))[0].id - 1)
                                if(!curKing.piece.inCheck(turn, waiting, mateBoard)) {
                                    return false
                                }
                            }
                            else {
                                mateBoard = [...board]
                            }
                        }
                        mateBoard = [...board]
                        
                    }
                }
            }
            return true
        }
        return false;
    }

    const movePiece = (id) => {
        let temp = turn
        let tempBoard = [...board]
       
        let curKing = board.filter((tile) => (tile.side === turn && tile.piece.value === 11))[0]
        

        if(board[id - 1].side === turn) {
            if(primary != -1) {
                tempBoard[primary].highlight = false
            }
            primary = id - 1;
            tempBoard[id - 1].highlight = true
            setBoard(tempBoard)    
        }
        else if(primary != -1) {
            if(board[primary].piece.move(primary, id - 1, tempBoard)) {    
                tempBoard[id - 1] = {...board[primary]}
                tempBoard[id - 1].id = id;
                tempBoard[id - 1].highlight = false
              
                tempBoard[primary] = {piece : null, icon : "", id : primary + 1, side : null, highlight : false}
            
                if(!curKing.piece.inCheck(turn, waiting, tempBoard)) {
                    if(holdPawn != -1) {//enpassent control
                        board[holdPawn - 1].piece.enpasent = false
                        holdPawn = -1;
                    }
                    if(board[primary].piece.value === 1) {
                        holdPawn = id
                    }

                    if(curKing.piece.inCheck(waiting, turn, tempBoard)) {//highlight enemy king
                        tempBoard[board.filter((tile) => (tile.side === waiting && tile.piece.value === 11))[0].id - 1].highlight = true;
                        new Audio(checkSound).play()
                    }
                    else{
                        tempBoard[board.filter((tile) => (tile.side === turn && tile.piece.value === 11))[0].id - 1].highlight = false;
                        new Audio(moveSound).play()
                    }

                    setBoard(tempBoard)
                    primary = -1;
                    turn = waiting
                    waiting = temp
                }
            }
        }
    }

    if(!checkMated()) {
        return (   
            <div className="chessBoard">
                {
                    board.map((tile) => {
                        let oldCone = colorOne//fix this
                        let oldCtwo = colorTwo
                        if(tile.id % 8 === 0) {
                            colourHold = colorOne
                            colorOne = colorTwo
                            colorTwo = colourHold
                        }
                        return <div className="sqaure" style={(tile.id % 2 === 0) ? {backgroundColor : oldCone} : {backgroundColor : oldCtwo}} key={tile.id}>
                            <button onClick={() => (movePiece(tile.id))} style={tile.highlight ? {backgroundColor : '#f33a30'} : {}} ><img src={tile.icon}></img></button>
                        </div>
                        
                    })        
                }
            </div>
            
        );
    }
    else {
        return (
            <div className='endGame'>
                {waiting} wins
                <button onClick={resetGame}>Play Again</button>
            </div>
        )
    }
    
}
 
export default Board;