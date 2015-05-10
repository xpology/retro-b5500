# WebUI Setting Up TSMCP and CANDE #



# Introduction #

This page describes how to add timesharing features to an existing emulator environment for the Burroughs B5500 system. At the end is a short sample session using the CANDE (Command and Edit) user interface.

## Prerequisites ##

The procedure described below assumes you have the retro-B5500 emulator installed and set up with the default DCMCP (Datacom MCP) software as described in [WebUI Getting Started](WebUIGettingStarted.md).

Before proceeding, you should have a basic familiarity with the emulator, SPO, card reader, and tape drive. See the following pages for information on these topics:

  * [Running the Emulator](WebUIRunningTheEmulator.md)
  * [Using the SPO](WebUIUsingTheSPO.md)
  * [Using the Card Reader](WebUIUsingTheCardReader.md)
  * [Using the Magnetic Tape Drive](WebUIUsingTheMagTapeDrive.md)

## Background ##

There were several variations of the MCP (Master Control Program) operating system used with the B5000 and B5500 computer systems over their long active lifetime. The original MCP for the B5000, released in early 1963, was somewhat limited, largely due to the severely restricted mass storage (two 32K-word drums) available on that system. The B5000 was a batch system, with most processing involving punched cards, magnetic tape, and possibly paper tape.

The B5500, first available in early 1965, was essentially the same system, but with the addition of a new Head-per-Track disk subsystem. HPT disk offered capacities up to one billion 6-bit characters. The MCP was completely rewritten to take advantage of this new disk, becoming known as the Disk File MCP (DFMCP).

Data communications interface hardware became available for the B5500 shortly after the DFMCP was released. The most commonly-used interface was the B249 Data Transmission Control Unit (DTCU) paired with one or more B487 Data Transmission Terminal Units (DTTU). Each DTTU could support up to 16 line-adapter slots. Each adapter supported one data communications circuit. Later a programmable interface, the Data Communications Processor (DCP), originally developed for the B6500 project, became available on the B5500. The B5500 was then renamed for marketing purposes as the B5700.

The DFMCP was enhanced to support this datacom equipment, becoming the Data Communications MCP (DCMCP). Its capabilities were oriented towards transaction processing, where multiple remote stations exchanged messages with one or more central server programs, rather than interactive timesharing.

## The TSMCP and CANDE ##

The DCMCP worked well in the environment it was designed for, but its approach to dynamic memory management was not well-suited for the user-oriented interactivity typical of a timesharing environment. To address that, Burroughs created another variation, the Timesharing MCP (TSMCP or TSSMCP).

The goal of the DCMCP was to maximize overall system throughput. The goal of the TSMCP was to handle large numbers of interactive tasks (i.e., those with long idle times between periods of actual processor use) and minimize user response time.

The TSMCP was derived from the DCMCP and supported all but a few of the DCMCP capabilities. The major change was a new memory management mechanism. Memory is typically the most critical resource in an on-line system. It was especially critical with the relatively small memory sizes available in the 1960s -- the 32K-word maximum for the B5500 was typical.

Core memory for the TSMCP is divided into two portions at a site-specified address known as the "fence." Memory below the fence is managed the same way as for the DCMCP, with data and code segments for all tasks allocated from one common heap. CANDE, MCP utilities (such as card and printer spooling) and the TSMCP itself run below the fence.

Memory above the fence is organized into a number of "swap areas" for use by both batch programs and the interactive programs initiated by remote users. Code and data segments for these programs are allocated solely within their respective swap areas. This supported "time slicing" of the memory space for both batch and interactive programs, as all of the non-shared memory used by a user program was in its swap area, and could be paged out to disk as a unit, making room for the swap areas of other users to be paged in for their time slice.

To manage remote interactive sessions, Burroughs developed the Command and Edit (CANDE, pronounced "candy") handler. This was a command-line interface somewhat similar to what we would call a shell today, but with a line-oriented text editor built in. Most terminal devices of the day were teletype-like devices, which could only support line editing. Full-screen editing was something still in the future.

With CANDE, users could create and edit source and text files, compile programs, and run programs, interacting with the programs through so-called "remote files." CANDE also supported commands to rename and delete files, list files to the terminal, copy files to line printer and card punch devices, and manage the interactive session. A basic security system isolated each user's files from other users. The owner could specify permissions that allowed other users to share individual files.

The TSMCP and CANDE were quite popular on B5500s used by schools and universities. Some systems continued to run through the late 1970s and possibly into the early 1980s. Sites with heavy batch loads or more transaction-oriented datacom requirements tended to stick with the DCMCP. Both variations of the MCP continued to be supported and enhanced in parallel by Burroughs through the 1970s. Only one MCP could be run on a system at a time, but as we will see, it requires little more than a Halt/Load (reboot) to switch between them.


# Overview of the Setup Process #

CANDE consists of a main program (`CANDE/TSHARER`) and numerous helper programs that are invoked by the main program as needed to do time-consuming tasks, such as a compilation or file resequence, on behalf of a user.  All this software is on the `SYSTEM` tape and must be loaded to disk before it can be run.

Once you have the necessary software loaded, you will need to set up two configuration files:

  * **`SYSTEM/DISK`** describes the data communications circuit and station environment, and is used only by the TSMCP. Since the web-based emulator currently supports only one terminal device, that configuration file has a fixed configuration, as shown below. This file is maintained by the program `SYSDISK/MAKER`.
  * **`USERS/CANDE`** defines the remote users. This file is used by CANDE. It is a binary file containing the user's login name, password, and per-account information. This file is maintained by the program `USER/CANDE`.

CANDE only runs under the TSMCP, so the next requirement is to Halt/Load the system under that MCP. TSMCP also requires a different set of System Intrinsics. After creating the two files above, you must specify the new MCP and Intrinsics files to the system and Halt/Load the system to initiate the TSMCP.

Once TSMCP initialization finishes, you must then initiate CANDE. At that point you can log in using the terminal and start timesharing.


# Setting Up the System #

This section discusses the step-by-step process to prepare the web-based emulator for the TSMCP and CANDE, switch to the TSMCP, and initiate CANDE.

## Preparing the Configuration Files ##

This first step takes place outside of the emulator. Using your text editor of choice, prepare a text file for a card deck to create the `SYSTEM/DISK` file as follows:

```
    ?EXECUTE SYSDISK/MAKER
    ?DATA CARD
    LINE,0,0,112,0,0,7,0,
    LINE,1,0,112,0,0,0,1,
    STA,0,0,0,0,"0","0",0,0,
    ?END
```

The web-based emulator supports the B249/B487 interface, with a single terminal on DTTU #1, buffer #0. That adapter slot is configured to have a 112-character buffer.

  * The first `LINE` card defines a pseudo-line that CANDE uses for its "schedule" sessions.
  * The second `LINE` card defines the datacom circuit for the emulated terminal.
  * The `STA` card defines the teletype station on that line. Teletype circuits could support only one station, so this card is optional.

Note the trailing commas ("`,`") on each of the cards. These are required. The only acceptable variation to this configuration concerns the last field on the second `LINE` card:

  * `0` indicates this is a switched (dial-up) circuit.
  * `1` indicates this is a direct-connect (hardwired) circuit. TSMCP considers the terminal to be permanently connected to the system

The emulated terminal behaves as if it is connected on a switched circuit, although you can choose either option on its `LINE` card. The only behavioral difference is that if you configure the line as switched, TSMCP will automatically disconnect when you log out from CANDE.

The `SYSDISK/MAKER` program and format of the cards it processes is documented in Section 1 of the [Burroughs B5700 Time Sharing System Reference Manual](http://bitsavers.org/pdf/burroughs/B5000_5500_5700/1058583_B5700_TSS_RefMan_Sep72.pdf).

Next, prepare another card deck to create the `USERS/CANDE` file:

```
    ?EXECUTE USER/CANDE
    ?DATA CARD
    $NEW
    $USER "B5500"
    PASSWORD "SECRET"
    NAME "USER NAME"
    NO CHARGE
```

Replace the text in the quoted strings with a user name, password, and display name of your choice. `$NEW` indicates that a new file will be created rather than an existing file being updated. `PASSWORD` and `NAME` are optional, and may be omitted. If no password is specified, you will log in with only your user name. `NO CHARGE` indicates that CANDE will not request a "charge code" (billing account number) as part of the log-in process.

You may create multiple user accounts by repeating the sequence of cards starting with the `$USER` card above.

There are a few additional options for configuring user accounts. The `USER/CANDE` program and format of the cards it processes is also documented in Section 1 of the [Burroughs B5700 Time Sharing System Reference Manual](http://bitsavers.org/pdf/burroughs/B5000_5500_5700/1058583_B5700_TSS_RefMan_Sep72.pdf).

## Loading the System Software Files ##

The next step is to load the necessary files from the Mark XIII `SYSTEM` tape image file. You should already have this file from the original setup for the DCMCP, as described in [WebUI Getting Started](WebUIGettingStarted.md).

First, Halt/Load the system to the DCMCP and set the date and time as necessary. You can also do the following steps under the TSMCP, but you will still need to Halt/Load after building the configuration files.

Load the `SYSTEM` tape image file into the tape drive (MTA window) by clicking the **LOAD** button on the drive, selecting the file, and then clicking the **REMOTE** button. You can confirm that the tape is loaded and ready by entering the following SPO command, but this is not necessary:

```
    OL MTA
```

CANDE requires quite a few files, and the easiest thing to do is simply load everything from the `SYSTEM` tape. With the tape loaded in the drive, enter the following command on the SPO:

```
    CC ADD FROM SYSTEM =/=; END
```

The `ADD` command will copy only those files that are not already present on disk. You can substitute `LOAD` for `ADD`, which will copy all the files specified, generally overwriting any existing files. This is safe to do, as MCP Library/Maintenance will not overwrite critical files, such as the running MCP.

Copying the files to disk will take a few minutes and output many messages to the SPO.

If you wish to do a more targeted load, you will need the following files:

```
    CC ADD FROM SYSTEM TSS/MCP, TSS/INT, USER/CANDE, SYSDISK/MAKER, -
       CANDE/TSHARER, FIND/DISK, GUARD/DISK, =/CANDE; END
```

Note the "`-`" at the end of the first line, which allows continuation of a control command. You should also load any additional compilers or utility programs you will want to use, e.g., `ALGOL/DISK`, `BASIC/DISK`, `COBOL/DISK`, `COBOL68/DISK`, `FORTRAN/DISK`, or `XALGOL/DISK`.

## Building the Configuration Files ##

Create the two configuration files, `SYSTEM/DISK` and `USERS/CANDE` by loading the card deck files you created above into the card reader and clicking the reader's **START** button. The decks can be run in any order. You can load both decks into the reader at the same time, if you wish.

Make sure you resolve any errors in these decks before proceeding. CANDE will not start without both files present.

## Initiating TSMCP and CANDE ##

The next step is to designate the MCP and Intrinsics files that should be
used at the next Halt/Load.  Enter the following two commands on the SPO:
on the SPO:

```
    CM TSS/MCP
    CI TSS/INT
```

These commands modify the bootstrap information in sector 0 of the disk. You should see responses similar to this:

```
    CM TSS/MCP
     NEXT MCP WILL BE TSS/MCP
    CI TSS/INT
     NEW INTRINSIC FILE IS: TSS/INT.
```

Now reboot the system by switching to the emulator's Console window and clicking first the **HALT** button and then the **LOAD** button (this is why it's called a Halt/Load). You should see a message indicating the TSMCP is now running. After initialization completes, enter the date and time as necessary:

```
    -H/L WITH TSS/MCP MARK XIII,F=16384[MODS=RRRRRRRR]-
     TIME IS 1429
     DATE IS THURSDAY, 11/17/83
    #TR PLEASE
    TR 1431
     TIME IS 1431
```

The "`F=16384`" indicates the fence location in memory. The value shown is the default if the fence was not specified at Cold Start time. You can change this value at any time using the `MF` SPO command, but it will only take effect at the next Halt/Load. Fence values must be in the range 8184 to 28644. Lower values give more memory to the swap areas for batch and interactive user programs. Higher values give more memory to the MCP and CANDE handler program. The default value is a good one to start with.

To switch back to the DCMCP, simply designate its MCP and intrinsics files and do another Halt/Load. The fence location is ignored by the DCMCP:

```
    CM MCP/DISK
    CI INT/DISK
```

Once the TSMCP has initialized, you can initiate CANDE with the following SPO command:

```
    CE
```

You should see the CANDE handler enter the mix and output its initialization message:

```
     0:CANDE/TSHARER/SITE= 1 BOJ 1516
    USERS/CANDE FILE DATED 00111783
```

This indicates that CANDE is running and ready for use.


# Using CANDE #

A typical B5500 timesharing system supported 20-30 users. The web-based emulator supports only one terminal, though, so only one user at a time can be signed on to CANDE in this environment. More information on using the emulated terminal can be found in the [Using Datacom](WebUIUsingDatacom.md) wiki page.

Note that six of the 64 characters in the B5500 character set were used as control characters by the teletype adapter hardware, and could not be used for their normal purpose in user program text and output messages:

| **Terminal** | **B5500 graphic** | **Input** | **Output** |
|:-------------|:------------------|:----------|:-----------|
| `}` | greater-or-equal | ignored | disconnect switched line |
| `{` | less-or-equal | ignored | carriage return |
| `!` | not-equal | disconnect | line feed |
| `>` | greater-than | ignored | X-on (ASCII DC1) |
| `<` | less-than | backspace | RUBOUT (ASCII DEL) |
| `~` | left-arrow | end of message | end of message |

See pages 3-15 and 3-16 in the [B5500 Handbook](http://bitsavers.org/pdf/burroughs/1031986_B5500_Handbook_Aug70.pdf) for information on the character substitutions used by the B249/B487.

To begin a session, click the **Connect** button on the terminal (DCA) window. The button should light.

## Logging In ##

After connecting the terminal, you should see a welcome message from CANDE within a few seconds:

```
   B5500 TIME SHARING - 01/00, STATION 02
   ENTER USER CODE, PLEASE-
```

Enter your user name as defined in the `USERS/CANDE` file. Officially, the end-of-message character for a teletype device was the left-arrow key (Shift-letter-O, "`~`" in the emulator), but as a convenience the emulator also supports using the **Enter** key. The terminal will echo a "`~`" in either case.

```
    ENTER USER CODE, PLEASE-B5500~
```

CANDE will next request your password and output several sequences of characters on the same line of the terminal. On a teletype device, this would create an inky blob on the paper, which would obscure the password when it was entered. That doesn't work so well on a web page, so just enter your password on top of those characters, followed by end-of-message. If you did not specify a password for your user name, just key end-of-message by itself.

```
    AND YOUR PASSWORD
    SECRET~@
    11/17/83  2:33 PM.
    GOOD AFTERNOON, USER NAME       YOU HAVE STATION 02

    #
```

At this point, you are logged in to CANDE and can begin entering commands. When you are finished with your session, enter `BYE` to log out. Alternatively, you can click the terminal's **Connect** button to disconnect.

CANDE commands and use of the terminal under CANDE are documented in the
[Burroughs B5500 Time Sharing System Terminal User's Guide](http://bitsavers.org/pdf/burroughs/B5000_5500_5700/1038205_B5500_TS_TerminalUG_Jun69.pdf). Note that the emulator does not presently support the paper tape terminal features described in this manual, particularly the CANDE `TAPE` command.


## Sample CANDE Session ##

Here is a sample session, illustrating creating, compiling, and running a simple BASIC program. CANDE requires line numbers (more properly known as sequence numbers) on all lines of all files, not just those for BASIC:

```
    CREATE FOO BASIC~
    FILE:FOO - TYPE:BASIC  -- CREATED
    10FOR I = 1 TO 5~
    20PRINT I, I*I~
    30NEXT I~
    40END~
    RUN~
     WAIT.

     COMPILING.

     END COMPILE 1.5 SEC.

     RUNNING

     1              1
     2              4
     3              9
     4              16
     5              25

     END FOO .4 SEC.
```

Note that the `RUN` command knows if the program source has not been compiled since it was last modified, and automatically recompiles before running it.

Now we edit the program slightly and recompile and rerun it. The "`*`" (`FIX`) command below searches line 20 for the literal string "`I*I`" and replaces it with "`SQR(I)`". Most non-alphanumeric characters can be used as token delimiters in this command.

Also note that multiple CANDE commands can be entered on one line, delimited by semicolons ("`;`"). Due to their nature, single-line entries (commands beginning with a sequence number) and `FIX` commands can appear only as the last command on a line.

```
    *20/I*I/SQR(I)~
    LIST; RUN~

    FILE:FOO - TYPE:BASIC  --11/17/83  3:26 PM.

    10 FOR I = 1 TO 5
    20 PRINT I, SQR(I)
    30 NEXT I
    40 END

     END LIST 3.5 SEC.

     COMPILING.

     END COMPILE 2.4 SEC.

     RUNNING

     1              1
     2              1.414214
     3              1.732051
     4              2
     5              2.236068

     END FOO .3 SEC.
```

Here is a slightly larger example of an Algol program that implements the outrageously-recursive Ackermann function. Note the use of the CANDE `SEQ` (sequence) command to automatically supply line numbers and the "`<`" character as a backspace:

```
    CREATE ACKMAN ALGOL~
    FILE:ACKMAN - TYPE:ALGOL  -- CREATED
    SEQ 100100+100~
    100100BEGIN~
    100200COMMENT ACKERMANN FUNCTION TEST;~
    100300INTEGER PROCEDURE ACKERMANN(A, B);~
    100400  VALUE A, B;~
    100500  INTEGER A, B;~
    100600  BEGIN~
    100700  ACKERMANN:=~
    100800      IF A = 0 THEN~
    100900        AC<<B+1~
    101000      ELSE IF B = 0 THEN~
    101100        ACKERMANN(A-1, 1)~
    101200       ELSE~
    101300        ACKERMANN(A-1, ACKERMANN(A, B-1));~
    101400  END ACKERMANN;~
    101500 ~
    101600INTEGER I, J, K;~
    101700FILE OUT DC 19 9<(1,10);~
    101800 ~
    101900FOR I:= 1 STEP 1 UNTIL 10 DO~
    102000  FOR J:= 1 STEP 1 UNTIL 10 DO~
    102100    BEGIN~
    102200    K:= ACKERMANN(I, J);~
    102300    WRITE(DC, F1, I, J, K);~
    102400    END FOR J;~
    102500END.~
    102600~
    #
    RUN~
     WAIT.

     COMPILING.
    NEAR LINE 102300 ERROR NUMBER 100 -- F1.

     ERR COMPILE .7 SEC.
```

Oops, we forgot to define the format `F1`. We will insert it by choosing a line number between two of the existing ones. Also, one of the `ELSE` clauses is indented too far, so we'll fix that as well.

Note that the `SEQ` command above was terminated by entering an empty line. A type-19 file declaration (line 101700) creates a datacom "remote" file, which is automatically assigned to the initiating terminal by the TSMCP.

```
    101750FORMAT F1 (2I4,I12);~
    FIX 101200. .~
    RUN~
     WAIT.

     COMPILING.

     END COMPILE .9 SEC.

     RUNNING

       1   1           3
       1   2           4
       1   3           5
       1   4           6
       1   5           7
       1   6           8
       1   7           9
       1   8          10
       1   9          11
       1  10          12
       2   1           5
       2   2           7
       2   3           9
       2   4          11
       2   5          13
       2   6          15
       2   7          17
       2   8          19
       2   9          21
       2  10          23
       3   1          13
       3   2          29
       3   3          61

    -STACK OVRFLW, LINE NO 101500

     ERR ACKMAN .3 SEC.
```

The Ackermann function is so heavily recursive that the program ran out of stack space while trying to evaluate `ACKERMANN(3,4)`.

Now we will save what we have done thus far, list the current version of the program, and log off CANDE:

```
    SAVE~
    FILE:ACKMAN - TYPE:ALGOL  -- SAVED.

    LIST~

    FILE:ACKMAN - TYPE:ALGOL  --11/25/83  9:06 PM.

    100100 BEGIN
    100200 COMMENT ACKERMANN FUNCTION TEST;
    100300 INTEGER PROCEDURE ACKERMANN(A, B);
    100400   VALUE A, B;
    100500   INTEGER A, B;
    100600   BEGIN
    100700   ACKERMANN:=
    100800       IF A = 0 THEN
    100900         B+1
    101000       ELSE IF B = 0 THEN
    101100         ACKERMANN(A-1, 1)
    101200       ELSE
    101300         ACKERMANN(A-1, ACKERMANN(A, B-1));
    101400   END ACKERMANN;
    101500
    101600 INTEGER I, J, K;
    101700 FILE OUT DC 19 (1,10);
    101750 FORMAT F1 (2I4,I12);
    101800
    101900 FOR I:= 1 STEP 1 UNTIL 10 DO
    102000   FOR J:= 1 STEP 1 UNTIL 10 DO
    102100     BEGIN
    102200     K:= ACKERMANN(I, J);
    102300     WRITE(DC, F1, I, J, K);
    102400     END FOR J;
    102500 END.

     END QUIKLST .4 SEC.

    BYE~
     ON FOR  35.9 SEC.
     C&E USE 1.8 SEC.
     EXECUTE 3.9 SEC.
     IO TIME 38.5 SEC.
     OFF AT   2:36 PM.
     GOODBYE B5500
    11/17/83
```


# Cold-Starting Directly to the TSMCP #

This page has described how to set up TSMCP and CANDE after the B5500 emulator has already been cold-started with the DCMCP. It is also possible to Cold Start directly to the TSMCP.

Peter Grootswagers has prepared a very nice set of instructions for cold-starting directly to TSMCP. This is available on the [retro-B5500 forum](http://groups.google.com/group/retro-b5500), dated 20 November 2013. The direct link to the post with his instructions is https://groups.google.com/forum/#!topic/retro-b5500/zCBSxow113M.



`________________`

_Credits_: The information in this wiki page was prepared by Tim Sirianni, with historical notes and editorial interference from Paul Kimpel.