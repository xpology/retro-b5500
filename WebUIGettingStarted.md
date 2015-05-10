# WebUI Getting Started #



# Introduction #

This page describes how to set up the retro-B5500 emulator to run in a web browser.

The emulator consists of a common Javascript core for the mainframe components of the system -- Processor, Central Control, Memory Modules, and Input/Output Units (channels), plus one or more user interfaces. The user interfaces are designed to be pluggable, so it is possible that the common emulator core could be used in multiple environments, each with their own characteristics and facilities for hosting a B5500 emulation.

A user interface (UI) is the external representation the system and provides the means by which you interact with it. Because the implementation of I/O devices depends heavily on the environment in which the UI operates, a UI for this emulator also includes all of the I/O devices (disk, card readers, line printers, SPO, etc.) The first UI designed for the emulator is the "WebUI," which is designed to run in a web browser. This page describes the setup procedures for that UI.

> _Note:_ The setup and initialization process for the emulator changed dramatically in release 1.00. This page describes the new process that started with that release. Prior to that time, this process was done by a special web page, `B5500ColdLoader.html`, which initialized the disk subsystem, performed the functions of a Cold Start, and loaded an initial set of system files. That script will still work, but it is now deprecated and will be removed in a future release. Instructions for the prior process are still available in [0.20-WebUIGettingStarted]. We strongly recommend you use the new process described below when using release 1.00 or later.

## Quick-start Overview ##

To set up and use the web-based emulator, you will need to do the following things, which are discussed in more detail in the following sections:

  * Use a suitable web browser -- at present, that means Mozilla Firefox or Google Chrome. See [The Web Browser](WebUIGettingStarted#The_Web_Browser.md) below for details.
  * Download and set up the emulator files on a web server. Alternatively, you can use our hosting service at http://www.phkimpel.us/B5500/. See [The Web Server](WebUIGettingStarted#The_Web_Server.md) and [The Emulator Files](WebUIGettingStarted#The_Emulator_Files.md) below for details.
  * Download a copy of the Burroughs B5500 system software tape images from http://www.phkimpel.us/B5500/webSite/SoftwareRequest.html. See [The Burroughs B5500 Software](WebUIGettingStarted#The_Burroughs_B5500_Software.md) below for details.
  * Configure the system components and create the disk subsystem. See [Configure the System](WebUIGettingStarted#Configure_the_System.md) below for details.
  * Cold Start the disk subsystem and load the system software to it. See [Initialize the System](WebUIGettingStarted#Initialize_the_System.md) below for details.
  * In your web browser, access the **`webUI/B5500Console.html`** home page from the web server to run the emulator.


# What You Will Need #

To use the web-based emulator, you will need four things:

  1. A suitable web browser.
  1. A web server configured to deliver files from the emulator directories (our hosting site is set up to do this).
  1. A copy of the files in the `emulator/` and `webUI/` directories from the emulator release (our hosting site already has the current version of these, ready to use).
  1. A copy of the Burroughs B5500 system software.

Each of these is described in more detail in the following sections.

## The Web Browser ##

The retro-B5500 emulator pushes the limits in several areas of current web-browser technology. We are taking advantage of many features in HTLM5, its related DOM APIs, and CSS 3. As a result, not every web browser is capable of hosting the emulator. We rely, at a minimum, on the following advanced features:

  * `IndexedDB` API (used to support the Head-per-Track disk subsystem)
  * `ArrayBuffer`, `DataView`, and `Blob` APIs
  * `File`, `FileList`, and `FileReader` APIs
  * Window `postMessage` API
  * `performance.now()` API
  * HTML `<meter>` element

As of this writing, the emulator has been tested with and works with Mozilla Firefox (version 21 and above) and Google Chrome (version 35 and above).<sup>1</sup> Somewhat earlier versions of these browsers may also work. Apple Safari will not support the emulator, because it does not as yet support the IndexedDB API.<sup>2</sup> The emulator runs fine under Firefox or Chrome on a Macintosh, however. Microsoft Internet Explorer (at least through IE10) will not support the emulator. We have not yet tried Opera.

## The Web Server ##

The emulator must be hosted on a web server. You will not be able to run the emulator simply by opening files in your browser from your local file system. The web server can run on your local system and serve files from there, but the emulator files must be served to the browser over HTTP.
See [Establish the Web Server](WebUIGettingStarted#Establish_the_Web_Server.md)
below for more details.

If you need a small, simple web server to host the emulator locally, we have had good success with **`mongoose`** (https://github.com/valenok/mongoose). It can run on the same workstation as your browser to serve the emulator files using the loop-back port (localhost or 127.0.0.1). Versions are available that run under Windows, Linux, UNIX, and Mac OS. It is extremely easy to set up. Under Windows, it can run as either a user program or as a service.

As an alternative to setting up and operating your own web server, you are welcome to use a web site we have set up on a hosting service. Just point your browser to the following URL:

> http://www.phkimpel.us/B5500/

If you choose to use this web site, or any other site that is already set up to serve the emulator files, rather than your own web server, you can skip the next section on downloading the emulator files.

Beginning with release 1.00, the emulator can now run off-line, without access to the web server from which it is hosted. Off-line operation is automatic when the browser supports the HTML5 "application cache" standard and is operating without a network connection or cannot contact the web server. See the discussion on off-line operation in [Using the Console](WebUIUsingTheConsole.md) for details on how this works.

## The Emulator Files ##

The web-based emulator is hosted in two directories (folders) of files:

  * **`emulator/`** contains the core mainframe modules. These are Javascript objects for the Processor, Central Control, and I/O Unit, plus a script that defines the configuration of the system components.
  * **`webUI/`** contains everything else you need to run the system. In particular, it contains the Console UI, the peripheral device drivers, and a Syllable Debugger utility that can be used to examine the state of the processors and memory while running programs under its control, including the MCP.

A third directory, **`tools/`** contains standalone utilities that can be used to maintain and examine the emulator environment. This directory also contains a few standard card decks that are used with the emulator:

  * **[COLDSTART-XIII.card](http://www.phkimpel.us/B5500/tools/COLDSTART-XIII.card)**: This contains the card images necessary to Cold Start the disk subsystem and load an initial set of system files. It consists of two standalone card-load programs and their parameter cards. You may use this as is, or as a base to create a customized load deck. See [Initialize the System](WebUIGettingStarted#Initialize_the_System.md) below for details on its use.
  * **[ESPOL-Binary-Card-Loader.card](http://www.phkimpel.us/B5500/tools/ESPOL-Binary-Card-Loader.card)**: This is a single binary-card image for the boot loader used with several card-load decks. Copies of this are already included in the Cold Start deck above.
  * **[CONTROL.DECK.card](http://www.phkimpel.us/B5500/tools/CONTROL.DECK.card)**: This is a single card image used to label a card reader for the MCP's "Load Control" (input spooling) utility.
  * **[END.CONTROL.card](http://www.phkimpel.us/B5500/tools/END.CONTROL.card)**: This is a single card image used to terminate use of Load Control on a card reader.

Recent releases of the emulator files can be obtained from
[our download site](https://drive.google.com/folderview?id=0BxqKm7v4xBswM29qUkxPTkVfYzg&usp=sharing). Each release is packaged as a separate `.zip` file.

If you use a web server that already has the emulator files set up, you do not need to download a separate copy of an emulator release. Unless you are running your web server on the same workstation as your web browser, you do not need to store the emulator scripts on your workstation.  You will need to download at least the Cold Start deck, though, which can be done using the link in the bullet list above.

## The Burroughs B5500 Software ##

The emulator files implement only the hardware portion of a B5500 system. To make the emulator useful, you also need the system software developed by Burroughs.

Burroughs became part of Unisys Corporation in 1986. Unisys still owns and maintains copyrights for the B5500 system software. We have acquired an educational/hobbyist license from Unisys to use the Mark XIII release of that software and make it available to others. It is _not_ open source software, however, and not officially part of this project, so we cannot include it on the open-source project site with the rest of the emulator files.

The Burroughs Mark XIII software consists of three binary tape image files from a release in 1971. We are making these files available through a
[page on our hosting service](http://www.phkimpel.us/B5500/webSite/SoftwareRequest.html). Go to that page, review and accept the licensing terms (they are not onerous), and download one or more of the tape images. See
[Download the B5500 System Software](WebUIGettingStarted#Download_the_B5500_System_Software.md) below for more instructions.

You will need to download at least the `SYSTEM` tape image, which contains the MCP operating system, compilers, and utilities. The other two images, `SYMBOL1` and `SYMBOL2`, contain source code for the Mark XIII release, and are not necessary to run the emulator.

Note that, while the emulator files are stored on the web server, the system software (and any other B5500 files you create within the emulator) will be stored locally on your workstation in a browser database, not on the web server. The [Cold Start process, discussed below](WebUIGettingStarted#Cold-Starting_the_System.md), is used to read these images and load them to the emulated disk subsystem within your web browser. We have also developed some utilities that will read and decode the data on these tape images. Those can be found in the **`tools/`** directory.


# Setting Up the Emulator #

This section describes how to set up the emulator and prepare it for use. If you do not already have one of the suitable browsers discussed above, acquire and install one of them before proceeding further.

## Establish the Web Server ##

When first starting out, the easiest thing to do is use our hosting service at http://www.phkimpel.us/B5500/. If you choose this option, nothing else needs to be done to set up a web server, and you can proceed with the next section.

If you wish to use your own web server, however, the general steps to set up the emulator files are:

  1. Create a new virtual directory for the web server, e.g., `/B5500/`, to hold the emulator files.
  1. To support the off-line "application cache" capability, you may need to create a mapping in the server between the "`.appcache`" file extension and the "`text/cache-manifest`" MIME type.
  1. Download one of the emulator releases (the one with the highest release-number suffix is usually best) from [our download site](https://drive.google.com/folderview?id=0BxqKm7v4xBswM29qUkxPTkVfYzg&usp=sharing).
  1. Unzip the release into the directory on your server's file system where the virtual directory is mapped. You will need the files from at least the **`emulator/`** and **`webUI/`** directories. Those directories should be created at the root of the virtual directory.

## Download the B5500 System Software ##

With a web browser, go to our hosting site at
http://www.phkimpel.us/B5500/webSite/SoftwareRequest.html,
review and accept the Unisys licensing terms, and download the `SYSTEM` tape image to your local workstation. You may also download the `SYMBOL1` and `SYMBOL2` tape images, but these are not required to run the emulator.

Unzip the downloaded files and store the resulting `.bcd` image files somewhere on your local workstation. You will need these files to initialize the disk subsystem, but they are not needed to run the emulator once the disk subsystem has been loaded.

Even though the `.bcd` files are not needed to run the emulator, you will probably want to keep them available on your workstation. Not all of the files from these tapes need to be loaded when the system is initialized. You may load a minimal set of files at first, and then incrementally load additional files as needed using MCP `?LOAD` or `?ADD` control cards as discussed under [Loading the System Files](WebUIGettingStarted#Loading_the_System_Files.md) below.

## Initialize the System ##

The web-based emulator uses HTML5 IndexedDB databases to implement disk storage, plus a small database for system configuration data. IndexedDB is essentially a small database server embedded within the web browser. The database data is stored in one or more files on your local workstation, but is usually hidden deep within the profile directory your browser maintains for your user account on the workstation. It generally is not easy to access the physical files for these databases, nor is there any need to do so.

> _Note:_ You _must_ run the emulator consistently from the same web site in order to access the same IndexedDB database. You must also consistently use the same web browser.

The IndexedDB API is subject to the "same-origin" policy used by many other web browser features. That means that the database used for the disk subsystem is restricted for use only by web pages and scripts from the same Internet host name as the one that created the database. Even though the database is physically stored on your workstation, if you load the emulator from different web sites, the browser will access separate databases for each web site.

This separation due to the same-origin policy also applies to a web server with multiple host names. For example, it is possible to run the emulator using two different URLs for our hosting site,

  * `http://www.phkimpel.us/B5500/webUI/B5500Console.html`
  * `http://phkimpel.us.B5500/webUI/B5500Console.html`

Both URLs reference the same physical server and web pages, but accessing the emulator through the two URLs will create two separate databases. We recommend you use the `www.phkimpel.us` hostname when accessing our hosting service.

Finally, different web browsers store their IndexedDB databases differently. A database created by one browser will be inaccessible to another, so you must use the same browser to run a given instance of the emulator. You may, of course, use different browsers to run separate instances of the emulator.

### Create the Initial System Configuration ###

When first starting out with the emulator, the easiest approach is to allow the emulator to create a default system and disk configuration. This will occur automatically the first time you "power on" the emulator unless you take specific steps beforehand to set up a non-default configuration. The default configuration can be easily changed after it is created. In addition, you can create and maintain multiple configurations, and switch among them.

See the [Configuring the System](WebUIConfiguringTheSystem.md) page for information on establishing a non-default configuration and modifying a configuration once it is established. The remainder of this section will describe how to proceed with a default initial configuration, and assumes you are installing the emulator on your workstation for the first time.

To begin, load the emulator home page into your web browser.  If you are running your own web server, access the `B5500Console.html` page in the `webUI/` directory. If you are running the emulator from our hosting site, simply go to

> http://www.phkimpel.us/B5500/webUI/B5500Console.html

The home page will look similar to this:

> ![https://googledrive.com/host/0BxqKm7v4xBswRjNYQnpqM0ItbkU/B5500-Home-Page.png](https://googledrive.com/host/0BxqKm7v4xBswRjNYQnpqM0ItbkU/B5500-Home-Page.png)

The home page has two buttons, each of which will start the emulator and open a window for the Operator Console:

  * **Start & Power On** will display the Console window and automatically power up the emulator, as if you had clicked the Console's green **POWER ON** button.
  * **Start - Powered Off** will simply display the Console window without powering up the emulator. This button is useful if you want to make configuration changes to the emulator, as those can only be made while the emulator is in a powered-off state.

The Console is a small control panel with several buttons and lights. The layout and function of this panel is described in the [Using the B5500 Console](WebUIUsingTheConsole.md) page.

Next, if you did not choose to power on the emulator when opening the Console window, click the green **POWER ON** button on the Console. It will illuminate.

Regardless of the method that was used to power on the emulator, it will now attempt to open its configuration database, and finding that it does not exist, will display an alert similar to this:

> https://googledrive.com/host/0BxqKm7v4xBswRjNYQnpqM0ItbkU/System-Config-Does-Not-Exist.PNG

In order to proceed with the initialization, click the **OK** button. The emulator will create its configuration database, store a default configuration named `Default` in it, and then display the following confirmation:

> https://googledrive.com/host/0BxqKm7v4xBswRjNYQnpqM0ItbkU/Configuration-Default-Created.PNG

When you click the **OK** button on this confirmation to continue, the emulator will proceed with its internal initialization and open several sub-windows for the peripheral I/O devices. When it attempts to initialize the disk subsystem (which does not have a window), it will find that the IndexedDB database for that subsystem does not exist and display the following alert:

> https://googledrive.com/host/0BxqKm7v4xBswRjNYQnpqM0ItbkU/Disk-Config-Does-Not-Exist.PNG

> Note that this alert is posted to the main Operator Console window and may be obscured by other windows which have opened. You may need to bring the Operator Console window to the foreground in order to see this alert.

Click the **OK** button on this alert to continue. The emulator will create a default disk subsystem named `B5500DiskUnit` and display this confirmation:

> https://googledrive.com/host/0BxqKm7v4xBswRjNYQnpqM0ItbkU/Disk-Config-Created.PNG

Clicking **OK** on the confirmation will allow the emulator to finish its initialization and open any additional windows for the peripheral I/O devices. The entire process should take only a few seconds. You are now ready to Cold Start the disk subsystem and load the system software.

### Default System Configuration ###

The default configuration created by the emulator will consist of the following system components:

  * One Processor, PA, set to operate as the control processor, P1.
  * Three Input/Output Control Units, IO1, IO2, IO3.
  * Eight 4K-word memory modules, for a total of 32K words (the maximum).
  * The Supervisory Printer, SPO.
  * One line printer, LPA.
  * One card reader, CRA.
  * One card punch, CPA.
  * One magnetic tape drive, MTA.
  * One Disk File Control Unit, DKA, with the Disk File Exchange (DFX) enabled.
  * One Data Communications Control Unit, DCA, with a single teletype terminal.

By default, the initial disk configuration for the emulator has a single Electronics Unit (EU) with 200,000 segments of disk storage. This is equivalent to a full complement of five Model I Storage Units (SUs) on the EU. That translates to six million B5500 words, or 48 million 6-bit characters of disk storage.

The amount of physical disk space used on your workstation for the emulated disk subsystem will vary depending on the number and size of B5500 files you store while running the emulator. It will also depend on the manner in which IndexedDB has been implemented by your browser. The physical disk space used may be many times the virtual space occupied by B5500 files.

The IndexedDB database will generally use only the physical disk space needed to support the disk subsystem, but that space will grow as you add more B5500 files in the emulated disk subsystem. Once physical disk space on your workstation is allocated to the database, it will persist until the disk subsystem is deleted. Deleting files in the B5500 environment will not reduce the amount of physical disk space used by the emulator on your workstation, but it will free up space within the emulated disk subsystem that other B5500 files can occupy.

Additional EUs, to a maximum of 20, may be added to the disk subsystem. The default system configuration has one Disk File Control, DKA. A second control, DKB may be added to the configuration, which will allow two disk I/Os to take place simultaneously, as long as they are to different EUs. Systems with two controls and multiple EUs may also include a Disk File Exchange (DFX), which will allow either control to access any EU. Enabling the DFX will limit the usable number of EUs to a maximum of 10, however.

See the [Configuring the System](WebUIConfiguringTheSystem.md) page for more information on configuring additional disk units and system components, creating multiple system configurations, and creating multiple disk subsystems.

### Cold-Starting the System ###

In B5500 parlance, a "Cold Start" is an initialization of the system that assumes there is nothing of value in the disk subsystem. A Cold Start creates an empty disk directory and initializes the MCP configuration data on the disk. It it similar in concept to formatting a disk in Microsoft Windows or creating a file system in Linux. Any prior contents of the disk subsystem are, of course, lost when you do this.

A real B5500 computer system arrived from the factory with nothing recorded on the disk units. A Cold Start is therefore necessary to create the MCP file system on the disk, establish an initial set of system operational settings, and load the MCP and its bootstrap program to the disk. In addition to initializing a new system, the Cold Start process can be used to reinitialize the disk for an existing system, or to recover from serious disk corruption. "Recover" in this case implies wiping out all of the data and reloading it from backup tapes.

> _Note:_ The Cold Start process _does not check for a previously existing file system_. It unconditionally creates a new file system, destroying any previously-existing one. You must use the following process with care, especially when you have multiple disk subsystems defined. Make sure you are Cold Starting the correct one.

Initializing the disk subsystem on a real B5500 involved loading two bootstrap programs from cards, the COLD loader and Tape-to-Disk loader. The COLD loader initialized the file system; the Tape-to-Disk loader copies the MCP operating system file from tape to the new file system and configures the bootstrap mechanism to find it. The emulator uses exactly the same process.

Before proceeding with this section, you must have completed the following:

  * You must have established an initial system configuration and disk subsystem, as described above under [Initialize the System](WebUIGettingStarted#Initialize-the-System.md). You can use the automatically-created default configuration or a custom one you have created, but it must exist first. If you just initialized the system as described in the previous sections, simply continue from that point.
  * You must have downloaded at least the `SYSTEM` tape image, as described in earlier sections, and have that tape image available on your workstation. The name of this tape image as downloaded from our hosting site is `B5500-XIII-SYSTEM-adc00257.bcd`.
  * You must have the Cold Start deck available on your workstation. You can copy this file from the `tools/` directory of the emulator files, or [download it from our hosting site](http://www.phkimpel.us/B5500/tools/COLDSTART-XIII.card).

If you wish to customize the parameter cards in the Cold Start deck, do so before proceeding further. A description of the parameter cards can be found in the [B5500 MCP Operations Manual](http://bitsavers.org/pdf/burroughs/B5000_B5500_B5700/1024916_B5500_B5700_OperMan_Sep68.pdf), starting on page 3-14 ("Card Load Select Programs"). Be careful not to alter the card images containing object code for the programs. Note that the two binary bootstrap card images at the start of each of the loaders are each 160 characters long, and each must be fully contained on one text line.                                           

The two parameter cards in the coldstart deck you probably will want to change are:

  * **ESU** make sure the number on this card matches the number of disk Electronic Units (EUs) in your hardware configuration. See the Operations Manual above on how this number should be specified on the card.
  * **DATE** You may wish to set today's date during the load, but this can be changed after the system does its initial halt/load.

The following steps accomplish the Cold Start:

  1. If the emulator is not already powered on, do so now.
  1. Load the Cold Start deck into the card reader, CRA, and make it ready. See the [Using the Card Reader](WebUIUsingTheCardReader.md) page for instructions on how to load a file from your workstation as a card deck into the reader and make the reader ready.
  1. Load the `SYSTEM` tape into the tape drive and make it ready. See [Using the Magnetic Tape Drive](WebUIUsingTheMagTapeDrive.md) for instructions on how to load a tape image file into a tape drive and make the drive ready. If your configuration has more than one tape drive, the image may be loaded into any of them.
  1. On the Operator Console window, click the yellow **CARD LOAD SELECT** button so that it is illuminated.
  1. On the Operator Console window, click the black **LOAD** button. You should see the reader begin reading cards. If nothing happens, make sure you have the correct deck loaded into the reader and that the reader is in a ready status. If necessary, fix any problems, click **HALT** on the Console, and click **LOAD** again.
  1. The reader will stop about half-way through the deck, after reading the COLD loader program and its parameter cards. It will create the new file system on the disk, store the options specified on the parameter cards, print the message "`DIRECTRY BUILT`" on the SPO, and halt. This completes the first phase of the Cold Start, which should take less than 30 seconds.
  1. To continue, click **HALT** and then **LOAD** on the Operator Console. Make sure that the **CARD LOAD SELECT** button is still illuminated. This reads the Tape-to-Disk loader program into memory and begins executing it. You should see the tape reel icon on the tape drive window spin as it searches the tape and loads the MCP object code to disk. When the load completes successfully, the tape will rewind and the program will print "`MCP FILE LOADED`" on the SPO.
  1. The Tape-to-Disk loader will then halt/load (boot) the system using the MCP file just loaded.

### The First Halt/Load ###

This completes the Cold Start process itself, but some additional steps are still necessary to make the system operational. After the halt/load  initiated by the Tape-to-Disk loader, the MCP will almost immediately print a message on the SPO:

```
    -H/L WITH MCP/DISK MARK XIII MODS RRRRRRR@-
```

The MCP will spend several seconds preparing its internal tables and initializing its private area of the disk, then print messages similar to the following on the SPO:

```
    DKA EU0 SU 1,2,3,4,5 WENT READY
     TIME IS 0000
     DATE IS SATURDAY, 9/ 1/84
    #TR PLEASE
```

The `DKA EU0`... message indicates the MCP has seen EU0 and its five SUs for the first time.  You will not see this message after subsequent halt/loads. The time is zero, indicating it has not yet been set. The date comes from one of the parameter cards for the COLD loader in the Cold Start deck. The `#TR PLEASE` message indicates that the MCP will not finish its initialization phase and begin normal operations until the time is set. This behavior is an option specified by one of the parameter cards in the Cold Start deck, and may be changed if desired. It can also be changed using the `RO` SPO command.

Before setting the time, you should set the date. The B5500 MCP ceased to be supported long before the year 2000 and is not Y2K-compatible. You may enter any date you wish, but it will be a 1900-based date. Hence, the days of the week output by the system may appear to be wrong, as they are being computed using years in the 1900s. We recommend that you choose a year in the 1970s or 1980s.

To set the date, use the `DT` command, specifying the date in mm/dd/yy format. Click the **INPUT REQUEST** button on the SPO. After the **READY** light illuminates, enter the following on your keyboard, substituting your date.

```
    DT 9/4/84
```

To terminate the command, either click the **END OF MESSAGE** button on the SPO or press **Enter** on your keyboard. The MCP will respond with a message indicating the new date.

The time is set in a similar manner using the `TR` command, specifying the time as a four-digit number in 24-hour format:

```
    TR 1936
```

Once the time has been entered, the MCP is ready for normal operations. You will immediately see the following message, which will be explained shortly.

```
    ##LOAD INTRNSC/DISK NOW....
```

The standard Cold Start deck has a short sequence of control cards following the Tape-to-Disk loader that will copy a minimal set of files from the `SYSTEM` tape. The card reader should still be ready from its use with the Tape-to-Disk loader, so once you set the time, you should see these cards being read, the `SYSTEM` tape begin to spin again, and a series of messages similar to the following print on the SPO:

```
     5:LIBMAIN/DISK= 1 BOJ 1936
     MTA IN 0 SYSTEM 1:LIBMAIN/DISK= 1
     INT/DISK LOADED,MTA
     PRNPBT/DISK LOADED,MTA
     LDCNTRL/DISK LOADED,MTA
     ALGOL/DISK LOADED,MTA
     COBOL/DISK LOADED,MTA
     FORTRAN/DISK LOADED,MTA
     XALGOL/DISK LOADED,MTA
     LOGOUT/DISK LOADED,MTA
     LIBMAIN/DISK= 1 EOJ 1937
```

This loads the System Intrinsics (`INT/DISK`), the printer output spooler (`PRNPBT/DISK`), the card input spooler (`LDCNTRL/DISK`), four compilers, and a program to print the system log file. You can edit the control cards at the end of the Cold Start deck to load more or fewer files, or add and remove files later using the SPO or another card deck. We recommend that you load at least the `INT/DISK` file at this point, however.

The System Intrinsics is a library of common routines that can be dynamically bound to user programs. It contains the math functions, input/output formatting routines, and a variety of other support routines used by various programming languages. Its name must be specified to the MCP, and since this is the first time the system has been booted since the Cold Start, the MCP does not yet have that name. Hence the "`##LOAD`..." message above.

To specify the name of the Intrinsics file, use the `CI` SPO command, thus:

```
    CI INT/DISK
```

You should only need to do this once. The MCP will store the name with the other system options on disk and automatically load the Intrinsics from that file after subsequent halt/loads.

> Note that some browsers have a limit on the amount of physical disk space an IndexedDB database may use without approval from the user. This limit varies, but is often in the range of 10-50MB. It is not unusual to hit this limit during the initial load of the system files.

> If during this load you notice that the emulator appears to hang, check the home page window for an alert requesting permission to use more disk space. Since other windows, such as the operator console and SPO, are often on top of the home page window, this alert may not be visible until the home page is brought to the top and given the focus. Once you give the browser approval to use more space, the emulator should resume normal operation. In our experience, this approval only needs to be given once per disk subsystem.

The system and MCP are now ready for use. For additional information on using the SPO, see the [Using the SPO](WebUIUsingTheSPO.md) page. For a general overview of emulator and MCP operations, see the [Running the Emulator](WebUIRunningTheEmulator.md) page.

### Loading Additional System Files ###

You may wish to load additional files from the `SYSTEM` tape once the Cold Start process is completed and the MCP is operational. The following are good candidates for additional system files to load, depending on how you plan to use the system:

  * `BASIC/DISK` -- the BASIC language compiler.
  * `COBOL/DISK` -- the original COBOL compiler.
  * `COBOL68/DISK` -- the ANSI COBOL-68 compiler.
  * `ESPOL/DISK` -- the ESPOL compiler, used to compile the MCP and standalone utility programs.
  * `FORTRAN/DISK` -- the FORTRAN-66 compiler.
  * `XALGOL/DISK` -- the Compatible Algol compiler. This was a version of Algol designed to ease transition from the B5500 to B6500/6700/7700 systems.
  * `AFILTER/DISK` -- the Algol Filter program.
  * `CFILTER/DISK` -- the COBOL Filter program.
  * `DUMP/ANALYZE` -- the system dump analyzer.
  * `FORTRAN/TRANS` -- the FORTRAN-to-Algol translator program.
  * `MAKCAST/DISK` -- a program to maintain CAST source library files.
  * `PATCH/MERGE` -- a program to merge multiple source patch files into one and resolve conflicts among patches.
  * `XREF/JONES` -- a program for formatting documentation and cross-referencing identifiers in source files.

"Library/Maintenance" is the portion of the MCP that manages disk files and maintains the disk directory. Among its features is the capability to dump disk files to and load disk files from magnetic tape. This was typically used for software distribution, file backup, archiving, and transferring files between systems.

Files can be loaded from Library/Maintenance volumes such as the `SYSTEM`, `SYMBOL1`, and `SYMBOL2` tape images using the `LOAD` and `ADD` control card commands, e.g.,

```
    ?LOAD FROM SYSTEM ESPOL/DISK, COBOL/DISK, DUMP/ANALYZE; END
```

The `ADD` command works the same as `LOAD`, except that it loads only those files that are not already in the disk directory.

A control card command can be continued across multiple card images by terminating a card with a hyphen (`-`) wherever a word or punctuation character might appear. The continuation line(s) that follow must not have an invalid character in column 1. The command must be terminated either by appending `;END` on the last line or by a final line with `?END` beginning in column 1.

All files having the same first or last identifier in their file name may be loaded by specifying _MFID_`/=` or `=/`_FID_, where _MFID_ is the "multi-file identifier" and _FID_ is the "file identifier" portion of a file name, respectively. All files from a tape can be loaded by specifying `=/=`. Library/Maintenance will not overwrite certain critical system files, such as the currently running MCP, the Intrinsics, or the system log.

See [Using the Magnetic Tape Drive](WebUIUsingTheMagTapeDrive.md) for more information on how to mount tape images onto a tape drive. See Section 4, and in particular page 4-15 ff, in http://bitsavers.org/pdf/burroughs/B5000_5500_5700/1024916_B5500_B5700_OperMan_Sep68.pdf for more information on control card syntax and the Library/Maintenance commands.


# Next Steps #

See [WebUI Running the Emulator](WebUIRunningTheEmulator.md) for detailed instructions on how to start the emulator and run the emulated B5500 system.

See [the Burroughs documents at bitsavers.org](http://bitsavers.org/pdf/burroughs/B5000_5500_5700/) for copies of the original Burroughs manuals and other reference information on the B5500 system.



`____________`

<sup>1</sup> Earlier versions of the emulator ran fine on Chrome 27 (the earliest version we tested), but somewhere around Chrome 30 the browser started crashing ("Aw, Snap!") while running the emulator. This appears to have been a problem with garbage collection, resulting in the browser running out of memory. The problem was resolved in mid-2014 with Chrome 35.

<sup>2</sup> Apple Safari is rumored to have support for IndexedDB in version 8. See http://caniuse.com/#feat=indexeddb for the current status.