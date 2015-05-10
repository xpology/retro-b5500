# WebUI Running the Emulator #


This page describes operation of the retro-B5500 emulator in a web browser. In order to use the emulator, it must first have been set up as described in [WebUI Getting Started](WebUIGettingStarted.md).

Note that some web browsers, particularly Firefox, may slow the execution of their web pages when those pages are running in a non-active tab of a window. The emulator runs continuously, and has a performance throttling mechanism that attempts to run the emulated processors at their real B5500 speed. To keep this mechanism synchronized with real time, do not open the B5500 Console in a window where one of the other tabs is active. It is best to open the Console in its own window, or at least keep it as the active tab in its window. If you need to use the browser to access other sites at the same time the emulator is running, it is best to open separate browser windows to do so.

Beginning with release 1.00, the emulator can now run off-line, without access to the web server from which it is hosted. Off-line operation is automatic when the browser is operating without a network connection or cannot contact the web server. See the discussion on off-line operation in [Using the Console](WebUIUsingTheConsole.md) for details on how this works.


# "Powering Up" the Emulator #

The emulator is initiated from the `B5500Console.html` home page in the `webUI/` directory of the emulator files on your web server. If you are running the emulator from our hosting site, simply go to

> http://www.phkimpel.us/B5500/webUI/B5500Console.html

The home page will look similar to this:

> ![https://googledrive.com/host/0BxqKm7v4xBswRjNYQnpqM0ItbkU/B5500-Home-Page.png](https://googledrive.com/host/0BxqKm7v4xBswRjNYQnpqM0ItbkU/B5500-Home-Page.png)

The home page has two buttons, each of which will start the emulator and open a window for the Operator Console:

  * **Start & Power On** will display the Console window and automatically power up the emulator, as if you had clicked the Console's green **POWER ON** button.
  * **Start - Powered Off** will simply display the Console window without powering up the emulator. This button is useful if you want to make configuration changes to the emulator, as those can only be made while the emulator is in a powered-off state.

The Console is a small control panel with several buttons and lights. The **HALT**, **CARD LOAD SELECT**, **LOAD**, **POWER ON**, and **POWER OFF** indicators are push buttons you can use to control the system. The rest of the indicators are lights controlled by the emulator. For a full description of the Console, see [Using the B5500 Console](WebUIUsingTheConsole.md).

> ![https://googledrive.com/host/0BxqKm7v4xBswRjNYQnpqM0ItbkU/B5500-Console.png](https://googledrive.com/host/0BxqKm7v4xBswRjNYQnpqM0ItbkU/B5500-Console.png)

To initialize the emulator, click the **POWER ON** button. The Console will display a brief lamp test. The **HALT** light will then illuminate, and several windows will open for the peripheral devices configured for the system -- SPO, card reader, line printer, etc.

You may move and resize these windows in any way you wish, including the Console window. You may also minimize any of the windows, but **_do not close them_**. Closing one of the peripheral device windows will render that device inoperable until the emulator is reinitialized with the **POWER ON** button. Closing the Console window will power down the emulator.

The SPO (Supervisory Printer) window is the one you will typically use the most. The Console window is also useful, as its lights give you information about how the system is running.


# Halt/Loading the MCP #

The process of loading an operating system into a computer and initiating it is commonly referred to as "booting" the system. On the B5500 (and all Burroughs/Unisys systems that followed it), the process is termed a "halt/load," after the two eponymous buttons on the Console. **HALT** stops the system. **LOAD** clears the registers and reads a bootstrap program into memory. The bootstrap for the MCP is known as the `KERNEL`. The MCP and `KERNEL` are placed on disk by the [Cold Start process](WebUIGettingStarted#Cold-Starting_the_System.md).

The B5500 supports two types of load. The primary one is from disk and the alternate is from cards, as controlled by the **CARD LOAD SELECT** push button. In its normal, unlit state, **CARD LOAD SELECT** causes the system to load 63 segments starting at segment 1 of Electronics Unit (EU) 0. When **CARD LOAD SELECT** is illuminated, the system loads one binary card from the primary card reader, CRA. Clicking the button toggles its state.

When the SPO window opens, it will print a short message indicating the emulator version. Please wait for this message to finish printing before attempting to load any program, including the MCP. The **LOAD** button will not function until the SPO is on line and goes to **REMOTE** status.

To load the MCP from disk, make sure the **CARD LOAD SELECT** button is not activated (unlit), then click the **LOAD** button. Several white annunciator lights on the lower portion of the Console should blink. These annunciators are unique to the emulated Console and were not present on a real B5500.

After a few seconds, a message similar to the following should start to appear on the SPO:

```
    -H/L WITH MCP/DISK MARK XIII MODS RRRRRRRR-
```

The string of "`R`"s indicates which of the eight memory modules is on line and ready. After several more seconds, you should see time and date messages appear:

```
    TIME IS 0814
    DATE IS SATURDAY, 7/ 9/83
```

Depending on the state of two MCP options (`USE DATE` and `USE TIME`) stored in the configuration data on disk, one or more of the following messages may also appear. If either of these messages prints on the SPO, you must respond to them, as discussed in the next section.

```
    #DT PLEASE
    #TR PLEASE
```

# Setting the Date and Time #

The B5500 did not have a persistent clock, just an interval timer. As a result, it was necessary to set the time, and perhaps the date, each time the system was halt/loaded. The two MCP options mentioned above could be set to require the operator to set the time and/or date before the MCP would exit its initialization mode and be ready to run user programs. The messages above indicate which of those options was set. Regardless of those option settings, it is always a good idea to set at least the time immediately after halt/loading the system.

To help enforce that practice, we recommend that you require the time to be set (`SO USE TIME`), but not the date (`RO USE DATE`) at each halt/load. These option settings are established by the project's default Cold Start configuration, but you may change them after booting the MCP. With those option settings, the system will require you to set the time, but use it's prior date unless you change it. Until the time is set, the MCP will not recognize ready status on any of the peripherals except the SPO, and will not run any user programs.

The time is set with the `TR` command. To enter a command, click the **INPUT REQUEST** button on the SPO window. The button will illuminate. When that light goes out and the **REMOTE** button lights (which may take a second -- the MCP must first initiate an I/O to the SPO) enter the following, substituting your current time in 24-hour format.

```
    TR 1457
```

The SPO will translate lower-case characters to upper case as you enter them -- you do not need to type commands in upper case. When you have finished entering the command, click the **END OF MESSAGE** button on the SPO window to terminate it. The system will respond by printing the new time on the SPO.

The date is set using the `DT` command. The B5500 was not Year-2000 compliant -- almost no one was looking that far ahead in the 1960s. You can, of course, set a date using the last two digits of the current year (e.g., `13` for 2013), but the system will interpret that as 1913. The Mark XIII system files have dates in the 1970s, however, so to the system it will appear those files have been created some 60 years in the future.

We recommend that you subtract 30 or 40 years from the current date (yielding one in the 1970s or '80s) and use that. Note that the day of week calculated by the system in this case will be incorrect for a 21st century year.

To set the date, enter a `DT` command with the date in month/day/year format:

```
    DT 7/13/83
```

You can also use hyphens (`-`) instead of slashes (`/`) to separate the fields of the dates. The MCP stores the date on disk, will preserve the date across halt/loads, and will automatically change the date when its time-of-day clock crosses midnight.


# Exploring the B5500 Environment #

Once the date and time are properly set, you can begin to use the system. A number of documents on [bitsavers.org](http://www.bitsavers.org/pdf/burroughs/B5000_5500_5700/) have useful information:

  * The [B5500 Handbook (April 1970)](http://www.bitsavers.org/pdf/burroughs/B5000_5500_5700/1031986_B5500_Handbook_Aug70.pdf) describes:
    * SPO output messages starting on page 4-1.
    * SPO commands starting on page 4-23.
  * The [B5500 Operation Manual (September 1968)](http://www.bitsavers.org/pdf/burroughs/B5000_5500_5700/1024916_B5500_B5700_OperMan_Sep68.pdf) has somewhat older information:
    * MCP run-time options starting on page 3-26.
    * Control card syntax starting on page 4-1.
    * Compiler option card ("$-cards") starting on page 4-26.
    * SPO output messages starting on page C-1.
    * SPO input commands starting on page C-40.
  * The [Narrative Description of the B5500 MCP](http://bitsavers.org/pdf/burroughs/B5000_5500_5700/1023579_Narrative_Description_Of_B5500_MCP_Oct66.pdf) gives a good overview of the MCP and how it works.
  * The [bitsavers index page for the B5000/B5500/B5700](http://www.bitsavers.org/pdf/burroughs/B5000_5500_5700/) lists a number of other documents, including reference manuals for the hardware and the compilers.

For more information on operating the SPO, and an overview of MCP commands for the SPO, see the [Using the SPO](WebUIUsingTheSPO.md) page.

You can prepare "card decks" as ordinary text files on your workstation and read them using one of the card reader peripherals, `CRA` or `CRB`. Our convention is to use a file extension of `.card` for these files, but the emulator applies no significance to the manner in which the files are named. The 64 valid ASCII characters you can use with the emulator are:

```
    0 1 2 3 4 5 6 7
    8 9 # @ ? : > {
    + A B C D E F G
    H I . [ & ( < ~
    | J K L M N O P
    Q R $ * - 0 ; {
      / S T U V W X
    Y Z , % ! = } "
```

The B5500 uses five special Algol characters that do not have ASCII equivalents, so we have chosen the following ASCII substitutions for them:

  * `~` for left-arrow
  * `|` for "�" (multiplication)
  * `{` for less-than-or-equal
  * `}` for greater-than-or-equal
  * `!` for not-equal

Lower-case letters will be translated to upper case by the card reader. The underscore ("`_`") will be accepted as a substitute for the left-arrow. The card reader will also accept five Unicode characters for the special Algol characters -- U+00D7 for multiplication, U+2190 for left-arrow, U+2260 for not-equal, U+2264 for less-than-or-equal, and U+2265 for greater-than-or-equal.

The card reader will consider all other ASCII or Unicode characters to be "invalid punches" in a card. An ASCII "`?`" in the first position in a line of text will be considered to be an "invalid punch" (for the purpose of identifying the line as a control card) but will be allowed as a valid character in any other position. Lines of text longer than 80 characters will be truncated to a length of 80; lines of text shorter than 80 characters will be padded with spaces to a length of 80.

Your "card deck" files should have the necessary control cards on the front (with a "`?`" or other invalid character in the first column) and a `?END` control card at the end. Here is a sample deck to compile and run a simple Algol program. The program's output will go to the line printer:

```
    ? COMPILE FIRST/TRY WITH ALGOL GO
    ? DATA CARD
    $ CARD LIST SINGLE
    BEGIN
    FILE LINE 18 (1, 17);
    INTEGER I;
    REAL X;
    I ~ 7;
    X ~ I/30;
    WRITE (LINE, <"X = ",F8.5>, X);
    END.
    ? END
```

To use the card reader:

  * Click the **Browse** or **Choose File** button in the card reader window to open a standard file-picker dialog and select the file you want to read. This will append the text file to the reader's "input hopper." You can select multiple files at one time on the open dialog, but the order that the files will be loaded into the reader is indeterminate.
  * Repeat as desired to add more "decks" to the input hopper.
  * Click the **START** button to make the reader ready. The **NOT READY** light will go out.
  * The MCP should sense the change in status within a second or two and start reading cards. The progress bar below the file selector indicates the relative number of cards remaining in the "input hopper." The last two cards that were read are shown in the box at the bottom of the card reader window.
  * After the last card is read from the "input hopper" the reader will go not-ready and the **NOT READY** light will again illuminate.
  * You can add more "decks" to the "input hopper" of the reader at any time. If the reader is currently reading cards, simply click the **STOP** button to make it not-ready, add more files to the input hopper as described above, and then click **START** to make it ready again. The MCP will automatically sense the status change and resume reading cards.
  * If a deck has control card errors, the MCP will stop reading cards and issue a message on the SPO. You have two choices:
    * Enter "`RY CRA`" (ready the reader) or "`CL CRA`" (clear the reader) on the SPO to abort the current "deck." The MCP will read cards without processing them until the next `?END` card and then resume processing the cards normally.
    * Click **STOP** to make the reader not ready, then click the progress bar below the file selector. The reader will ask if you want to "empty the input hopper." If you click **OK**, the entire contents of the "input hopper" will be discarded. You can then fix the deck and reload it into the reader.


# Shutting Down the Emulator #

When you are finished using the emulator, click the **HALT** button on the Console, then click **POWER OFF**. When **POWER OFF** is clicked, the emulator will close all peripheral device windows, but will leave the Console window open.

These steps are not strictly necessary (you can just quit the browser), but they will insure that all outstanding I/Os are completed and the emulator comes to an orderly halt. It will also save you the trouble of closing all of those peripheral device windows manually, one at a time.

If you want to restart the emulator later, you can leave the Console window open and simply click **POWER ON** when you are ready to resume. One reason to do this is to change the system configuration, which can only be down with the power off. All of the other windows in the currently-selected configuration are reopened when the emulator is reinitialized by the **POWER ON** button.