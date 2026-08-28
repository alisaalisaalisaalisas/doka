import asyncio


async def task1():
    print("task1 start")
    await asyncio.sleep(1)
    print("task1 end")


async def task2():
    print("task2 start")
    await asyncio.sleep(1)
    print("task2 end")


async def main():
    await asyncio.gather(task1(), task2())


asyncio.run(main())
