"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

type Disk = number
type Tower = Disk[]
type GameState = [Tower, Tower, Tower]

export function TowersOfHanoiComponent() {
  const [disks, setDisks] = useState(3)
  const [towers, setTowers] = useState<GameState>([[], [], []])
  const [selectedTower, setSelectedTower] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSolving, setIsSolving] = useState(false)
  const solveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const initializeTowers = useCallback(() => {
    const newTowers: GameState = [Array.from({ length: disks }, (_, i) => disks - i), [], []]
    setTowers(newTowers)
    setMoves(0)
    setTime(0)
    setIsPlaying(false)
    setIsSolving(false)
    if (solveTimeoutRef.current) {
      clearTimeout(solveTimeoutRef.current)
    }
  }, [disks])

  useEffect(() => {
    initializeTowers()
  }, [initializeTowers])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && !isSolving) {
      interval = setInterval(() => setTime((prevTime) => prevTime + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, isSolving])

  const moveDisk = (from: number, to: number) => {
    setTowers((prevTowers) => {
      const newTowers = prevTowers.map((tower) => [...tower])
      const disk = newTowers[from].pop()!
      if (newTowers[to].length === 0 || disk < newTowers[to][newTowers[to].length - 1]) {
        newTowers[to].push(disk)
        setMoves((prevMoves) => prevMoves + 1)
      } else {
        newTowers[from].push(disk)
      }
      return newTowers as GameState
    })
  }

  const handleTowerClick = (towerIndex: number) => {
    if (isSolving) return

    if (selectedTower === null) {
      if (towers[towerIndex].length > 0) {
        setSelectedTower(towerIndex)
      }
    } else {
      moveDisk(selectedTower, towerIndex)
      setSelectedTower(null)
      setIsPlaying(true)
    }
  }

  const solve = async (n: number, source: number, auxiliary: number, target: number) => {
    if (n === 1) {
      await new Promise<void>((resolve) => {
        solveTimeoutRef.current = setTimeout(() => {
          if (!isSolving) return
          moveDisk(source, target)
          resolve()
        }, 500)
      })
    } else {
      await solve(n - 1, source, target, auxiliary)
      await new Promise<void>((resolve) => {
        solveTimeoutRef.current = setTimeout(() => {
          if (!isSolving) return
          moveDisk(source, target)
          resolve()
        }, 500)
      })
      await solve(n - 1, auxiliary, source, target)
    }
  }

  const handleAutoSolve = async () => {
    setIsSolving(true)
    setIsPlaying(true)
    initializeTowers()
    await solve(disks, 0, 1, 2)
    setIsSolving(false)
  }

  const handleReset = () => {
    initializeTowers()
  }

  const handleDisksChange = (value: number[]) => {
    setDisks(value[0])
    initializeTowers()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Towers of Hanoi</h1>
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold text-gray-700">Moves: {moves}</div>
          <div className="text-lg font-semibold text-gray-700">Time: {formatTime(time)}</div>
        </div>
        <div className="flex justify-between items-end h-64 mb-8">
          {towers.map((tower, index) => (
            <div
              key={index}
              className={`relative flex flex-col-reverse items-center w-1/4 h-full border-b-4 border-gray-400 cursor-pointer ${
                selectedTower === index ? "bg-gray-200" : ""
              }`}
              onClick={() => handleTowerClick(index)}
            >
              {tower.map((disk, diskIndex) => (
                <div
                  key={diskIndex}
                  className="absolute bottom-0 h-4 rounded-full"
                  style={{
                    width: `${(disk / disks) * 100}%`,
                    backgroundColor: `hsl(${(disk / disks) * 360}, 40%, 50%)`,
                    bottom: `${diskIndex * 1.2}rem`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="mr-2 font-semibold text-gray-700">Disks:</span>
            <Slider
              value={[disks]}
              onValueChange={handleDisksChange}
              min={3}
              max={8}
              step={1}
              className="w-32"
            />
            <span className="ml-2 text-gray-700">{disks}</span>
          </div>
          <Button onClick={handleReset} variant="outline" className="text-gray-700 border-gray-300">
            Reset
          </Button>
          <Button onClick={handleAutoSolve} disabled={isSolving} variant="outline" className="text-gray-700 border-gray-300">
            {isSolving ? "Solving..." : "Auto Solve"}
          </Button>
        </div>
        <div className="text-sm text-gray-600 mt-4">
          Optimal solution: {Math.pow(2, disks) - 1} moves
        </div>
      </div>
    </div>
  )
}