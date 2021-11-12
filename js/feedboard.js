/* Feedboard 0.4 */


// opml file with links
var linklibrary = ['library.opml', 
				   //'https://raw.githubusercontent.com/marklogic-community/feed/master/test-scripts/data/opml_google-reader.opml',
				   //'http://webdesigndenhaag.net/project/feedboard/construct.opml',
				   //http://webdesigndenhaag.net/lab/wp-links-opml.php'
				  ];
// globals
var archive = []; // feedchannel list to be extended on first selection
var groups = []; // array with group names
var channels = []; // array of urls selected for display
var bundle = []; // array of items from selected urls
var filterbundle = [];
var maxf = 3; // default amount of feeditems each url

var promises = 0;




onload = function(){

    document.getElementById("contentbar").innerHTML = 'Importing opml data..';

	loadOPMLlibrary(linklibrary);


}

function loadDisplay(){

	displaySettings();
    displayGroups();
    displayBundle();

}


function loadOPMLlibrary(lib){

		if(lib.length > 0 ){

		  for (var i = 0; i < lib.length; i++) {

			importOpmlChannel(lib[i], function(){
				promises--;
				if(promises == 0){

					loadDisplay();

				}
			});

		  }

		}else{
		  document.getElementById("contentbar").innerHTML = 'No OPML libs (feedlists) available';
		}
	}

/********* Data ***********/

function importOpmlChannel(url, callback){

    var validation = validateOpmlUrl(url, function(valid){


		if(valid['chk'] == 1){

			var opml = valid['data'];
			var outlines = opml.getElementsByTagName("outline");

			for (var i = 0; i < outlines.length; i++) {

				if(outlines[i].getAttribute('type') == 'category'){
					// list sub outlines(links) to stack format (array ['groupname','urls'])
					// list urls as new channels (without loading 'items')

					var grp = outlines[i].getAttribute('title');
					var lnks = outlines[i].getElementsByTagName("outline");
					if(lnks.length > 0){

					   for (var l = 0; l < lnks.length; l++) {
						  if(lnks[l].getAttribute('xmlUrl') != ''){
							  var nwchannel = [];
							  nwchannel['title'] = lnks[l].getAttribute('text');
							  nwchannel['feedurl'] = lnks[l].getAttribute('xmlUrl');
							  nwchannel['website'] = lnks[l].getAttribute('htmlUrl');
							  nwchannel['group'] = grp;
							  archive.push(nwchannel);
							  if(checkArr(groups,grp) == 0){
								  groups.push(grp);
							  }

						  }
					   }

					}
				}else
				if( ( outlines[i].getAttribute('type') == 'link' || outlines[i].getAttribute('type') == 'rss') &&
				   outlines[i].parentElement.getAttribute('type') != 'category' ){
					// uncategorized
					var grp = 'uncategorized';
					var lnks = outlines[i];

						  if(lnks.getAttribute('xmlUrl') != ''){
							  var nwchannel = [];
							  nwchannel['title'] = lnks.getAttribute('text');
							  nwchannel['feedurl'] = lnks.getAttribute('xmlUrl');
							  nwchannel['website'] = lnks.getAttribute('htmlUrl');
							  nwchannel['group'] = grp;

							  	if( !getSubArr(archive, 'feedurl', lnks.getAttribute('xmlUrl') ) ){
							  		archive.push(nwchannel); // only archive new urls
						  		}

							  if(checkArr(groups,grp) == 0){
								  groups.push(grp);
							  }

						  }


				}
			}
		}else{
			document.getElementById("contentbar").innerHTML = 'No feeds available';
		}

		callback();

	});
}

function importFeedChannel(url,group, callback){

    if(typeof(group) === 'undefined' || typeof(group) === 'undefined') group = 'default';

    	var validate = validateFeedUrl(url, function(valid){

			promises--;

			if(valid['chk'] == 1){

               var feed = valid['data'];
               var newchannel = [];
               newchannel['title'] = feed.getElementsByTagName("title")[0].firstChild.nodeValue;
               newchannel['feedurl'] = url;
               newchannel['group'] = group;
               //newchannel['link'] = feed.getElementsByTagName("link")[0].firstChild.nodeValue;

               newchannel['items'] = [];

			   if( feed.getElementsByTagName("item") ){
               	  var items = feed.getElementsByTagName("item");
			   }else if( feed.getElementsByTagName("entry") ){
				  var items = feed.getElementsByTagName("entry");
			   }


			   for (var i = 0; i < 30; i++) {
                   var item = [];

				   if(typeof items[i] != 'undefined'){

				   if(items[i].getElementsByTagName("title")[0] && items[i].getElementsByTagName("title")[0].firstChild)
                   item['title'] = items[i].getElementsByTagName("title")[0].firstChild.nodeValue;

				   if(items[i].getElementsByTagName("description")[0])
                   item['description'] = items[i].getElementsByTagName("description")[0].firstChild.nodeValue;

				   if(items[i].getElementsByTagName("content")[0] && items[i].getElementsByTagName("content")[0].firstChild )
                   item['description'] = items[i].getElementsByTagName("content")[0].firstChild.nodeValue;


				   if( items[i].getElementsByTagName("pubDate")[0] )
				   item['pubDate'] = items[i].getElementsByTagName("pubDate")[0].firstChild.nodeValue;

				   if(items[i].getElementsByTagName("link")[0])
				   item['link'] = items[i].getElementsByTagName("link")[0].firstChild.nodeValue;


				   // get image
					if(items[i].getElementsByTagName("image")[0] ){
						if( items[i].getElementsByTagName("image")[0].getElementsByTagName("url") ){
				   			item['image'] = items[i].getElementsByTagName("image")[0].getElementsByTagName("url").nodeValue;
						}else
						if( items[i].getElementsByTagName("image")[0].firstchild ){
				   			item['image'] = items[i].getElementsByTagName("image")[0].firstchild.nodeValue;
						}
					}else
					if( items[i].getElementsByTagName("enclosure") && items[i].getElementsByTagName("enclosure").type == 'image/jpeg' ){
				   		item['image'] = items[i].getElementsByTagName("enclosure").url;
					}else
					if( items[i].getElementsByTagName('media\\:thumbnail')[0] && items[i].getElementsByTagName('media\\:thumbnail')[0].firstChild ){
						item['image'] = items[i].getElementsByTagName('media\\:thumbnail')[0].firstChild.nodeValue;
					}else
					if(item['description']){
					// image tag?
					// enclosure tag? <enclosure type="image/jpeg" url="https://nos.nl/data/image/2017/10/17/425020/320x320.jpg" />
					   	var imgs = getImageUrlsFromString(item['description']);
						if(imgs && imgs.length > 0 && typeof imgs != 'undefined'){
							//var coverimage = document.createElement('img');
							if(imgs[0]){
								item['image'] = imgs[0];
							}
						}
					}

				   }
                   item['channelgroup'] = group;
                   item['feedurl'] = url;
                   item['feedtitle'] = newchannel['title'];

                   newchannel['items'].push(item);
               }

               callback(newchannel); //return newchannel;

            }else{

               callback(false); //return false;

            }

	});
}

/********* Events ***********/
function toggleChannel(opt){
    var url = opt.getAttribute('data-feedurl');
    var group = opt.getAttribute('data-group');
    var elements = document.querySelectorAll('[data-feedurl]');


    if(checkSubArr(channels,'feedurl',url) == 1){

        removeUrlfromBundle(url,group);

		// remove from filterlist too
		for(var i = filterbundle.length; i--;){
			if (filterbundle[i] === url ){
				filterbundle.splice(i, 1);
			}
		}

        //opt.setAttribute('class','nonactive');
        for ( var i = 0; i < elements.length; i++ ) {
            if(elements[i].getAttribute('data-feedurl') == url){
            elements[i].setAttribute('class','nonactive');
            }
        }

    }else{
        //opt.setAttribute('class','active');
        for ( var i = 0; i < elements.length; i++ ) {
            if(elements[i].getAttribute('data-feedurl') == url){
            elements[i].setAttribute('class','active');
			elements[i].classList.add('loading');
            }
        }

        addUrlToBundle(url,group);
    }


	// de activate group if none submember selected
	var grpchk = checkSubArr( bundle,'group', group );
	if(grpchk == 0){
		var elements = document.querySelectorAll('[data-name]');
		for ( var i = 0; i < elements.length; i++ ) {
            if(elements[i].getAttribute('data-name') == group){
            elements[i].setAttribute('class','nonactive');
            }
        }
	}

}

function addUrlToBundle(url,group){ // add channel feed items to bundle

	var channel = getArchiveUrl(url,group); //getSubArr(archive,'feedurl',url);

    var urlmax =  document.getElementById("feedmax").options[document.getElementById("feedmax").selectedIndex].text;

    if(channel){

	filterbundle.push(url);

        if(!channel['items']){

            var importing = importFeedChannel( url, group, function(newchannel){

				if(newchannel['items']){

					for(var c = newchannel['items'].length; c--;){
						// add channel info (website url from opml list, not from rss)
						newchannel['items'][c]['website'] = channel['website'];
						newchannel['items'][c]['group'] = group;
						newchannel['items'][c]['feedtitle'] = channel['title'];
					}
					for(var i = archive.length; i--;){
						if (archive[i]['feedurl'] === url && archive[i]['group'] === group){
							archive[i]['items'] = newchannel['items']; // add loaded items to url archive
							channel = archive[i];
						}
					}

					if(newchannel['items'].length > 0){
						channels.push(newchannel); // url to channels selection
						for(i=0;i<urlmax;i++){
							bundle.push(channel['items'][i]); // url items to bundle
						}
						sortBundle();
					}

				}else{

					alert('Problemo! importing ' + url );

				}

				// remove loading class from button..
				var loadingelements = document.querySelectorAll('[data-feedurl]');
				for ( var i = 0; i < loadingelements.length; i++ ) {
            		if(loadingelements[i].getAttribute('data-feedurl') == url){
            			loadingelements[i].classList.remove('loading');
            		}
				}


    			displayBundle();

			});

        }else{

			if(channel['items'].length > 0){
				channels.push(channel); // url to channels selection
				for(i=0;i<urlmax;i++){
					bundle.push(channel['items'][i]); // url items to bundle
				}
				sortBundle();
    			displayBundle();
			}
		}




    }
}

function removeUrlfromBundle(url,group){ // remove channel feed items from channels and bundle

	// remove from active channels
	for(var i = channels.length; i--;){
	    if (channels[i]['feedurl'] === url && channels[i]['group'] === group){
		channels.splice(i, 1);
	    }
	}
	// remove from bundle
	for(var i = bundle.length; i--;){
		if (bundle[i]['feedurl'] === url && bundle[i]['channelgroup'] === group){
		    bundle.splice(i, 1);
		}
	}

    displayBundle();
}

function reloadBundle(){
    document.getElementById("contentbar").innerHTML = '';
    var urlmax = document.getElementById("feedmax").options[document.getElementById("feedmax").selectedIndex].text;
    bundle = [];
    if(channels.length > 0){
        for(i=0;i<channels.length;i++){
            for(c=0;c<urlmax;c++){
                bundle.push(channels[i]['items'][c]);
            }
        }
        sortBundle();
   }
   displayBundle();
}

/********* UI ***********/
function displayBundle(){

	// define text length
	var l = 140;
    if(document.getElementById("setminimize").checked != true){
		l = 680;
	}

    document.getElementById("contentbar").innerHTML = '';
    var holder = document.createElement('ul');
    holder.setAttribute('id','feedbundle');

    if(bundle.length > 0){

        for(i=0;i<bundle.length;i++){

		if( checkArr( filterbundle, bundle[i]['feedurl'] ) == 1 ) {

          var box = document.createElement('li');
          box.setAttribute('class','bundle-item');
          box.setAttribute('data-group', bundle[i]['group'] );
          box.setAttribute('data-feedurl', bundle[i]['link'] );

          var ttl = document.createElement('h3');
          var lnk = document.createElement('a');
          lnk.setAttribute('href',bundle[i]['link']);
          lnk.setAttribute('target', '_blank');

          var bttl = document.createTextNode(bundle[i]['title']);
          lnk.appendChild(bttl);
          ttl.appendChild(lnk);

          var metabox = document.createElement('h4');

          var web = document.createElement('a');
          web.setAttribute('href',bundle[i]['website']);
          web.setAttribute('target', '_blank');
          var fttl = document.createTextNode(bundle[i]['feedtitle']);
          web.appendChild(fttl);
          metabox.appendChild(web); // website

          var dtt = document.createElement('time');
          var ts = ' on '+bundle[i]['pubDate'];
          //var tm = calculateSince(ts);
          var dtxt = document.createTextNode( ts );
          dtt.appendChild(dtxt);
	  	  metabox.appendChild(dtt); // pubdate
			if( bundle[i]['image'] ){

				var coverimage = document.createElement('img');
				coverimage.setAttribute( 'src', bundle[i]['image'] );
				coverimage.setAttribute( 'widht', '20%' );
				coverimage.setAttribute( 'height', 'auto' );
				coverimage.setAttribute( 'onerror', 'javascript:this.src=\'https://avatars3.githubusercontent.com/u/20241931?v=3&s=460\'' );
				box.appendChild(coverimage);
			/*
		  	var imgs = getImageUrlsFromString(bundle[i]['description']);
			var coverimage = document.createElement('img');
			if(imgs[0]){
			coverimage.setAttribute( 'src', imgs[0] );
			coverimage.setAttribute( 'onerror', 'javascript:this.src=\'https://avatars3.githubusercontent.com/u/20241931?v=3&s=460\'' );
			box.appendChild(coverimage);
			}
			*/
			}

			console.log(coverimage);

	      box.appendChild(metabox); // time and url
          box.appendChild(ttl); // item title

		  var txt = document.createElement('div');
          txt.setAttribute('class', 'itemtextbox');
          txt.innerHTML = cleanHtmlText(bundle[i]['description'],l);

          box.appendChild(txt);

          holder.appendChild(box);

		}


       	}

    }else{
          var box = document.createElement('li');
          box.setAttribute('class','no-display');
          box.innerHTML = 'Select a channel for display';
          holder.appendChild(box);
    }

    document.getElementById("contentbar").appendChild(holder);

	document.getElementById("contentbar").classList.remove('fullview');
	if(document.getElementById("setminimize").checked != true){
		document.getElementById("contentbar").classList.add('fullview');
	}

    displayChannels();
    setActiveOptions();

    document.getElementById("loaderbox").className = 'hidden';

}

function displayGroups(){
    if(groups.length > 0){
        var box = document.createElement('ul');
        box.setAttribute('id','groupmenu');
        for(i=0;i<groups.length;i++){
            var opt = document.createElement('li');
            opt.setAttribute('data-name', groups[i]);
            opt.setAttribute('onclick','displayGroupChannels(this);');
            opt.innerHTML = groups[i];
            box.appendChild(opt);
        }
        document.getElementById("navbar").appendChild(box);
    }
}

function displayGroupChannels(obj){
    var group = obj.getAttribute('data-name');
    var groupmenu = document.getElementById("groupmenu");
    var options = groupmenu.getElementsByTagName('li');
    for(i=0;i<options.length;i++){
        options[i].removeAttribute('id');
    }
    obj.setAttribute('id', 'currentgroup');
    if(!document.getElementById("groupchannelbox")){
        var box = document.createElement('ul');
        box.setAttribute('id','groupchannelbox');
    }else{
        var box = document.getElementById("groupchannelbox");
        box.innerHTML = '';
    }
    for(i=0;i<archive.length;i++){
        if(archive[i]['group'] == group){
            var opt = document.createElement('li');
            opt.setAttribute('data-feedurl',archive[i]['feedurl']);
            opt.setAttribute('data-group',archive[i]['group']);
            opt.setAttribute('onclick','toggleChannel(this);');
            opt.innerHTML = archive[i]['title'];

			var del = document.createElement('span');
			del.classList.add('delete');
			del.innerHTML = 'x';

			opt.appendChild(del);
            box.appendChild(opt);
        }
    }
    document.getElementById("navbar").appendChild(box);
    setActiveOptions();
}

function displayChannels(){
    document.getElementById("sidebar").innerHTML = '';
    if(channels.length > 0){
        var activebox = document.createElement('div');
        activebox.setAttribute('id','activeselectbox');
        var atl = document.createElement('h3');
        atl.innerHTML = 'Bundle';
        activebox.appendChild(atl);

        for(h=0;h<groups.length;h++){
            if(checkSubArr(channels,'group',groups[h]) == 1){

				var box = document.createElement('div');
				box.setAttribute('data-name', groups[h]);


				var ttl = document.createElement('h4');
				ttl.setAttribute('onclick', 'toggleChannelGroup(this.parentNode);' );
				ttl.innerHTML = groups[h];
				box.appendChild(ttl);


				var lst = document.createElement('ul');
						for(i=0;i<channels.length;i++){
							if(channels[i]['group'] == groups[h]){
								var opt = document.createElement('li');

								var flt = document.createElement('span');
								flt.classList.add('filter');

								var fltchk = document.createElement('input');//'<input type="checkbox" />';

								fltchk.setAttribute('type','checkbox');
								if( checkArr( filterbundle, channels[i]['feedurl']) == 1){
									fltchk.setAttribute('checked','checked');
								}

								flt.appendChild(fltchk);
								flt.setAttribute('onchange','toggleChannelFilter(this.parentNode);');


								var del = document.createElement('span');
								del.classList.add('delete');
								del.innerHTML = 'x';
								del.setAttribute('onclick','toggleChannel(this.parentNode);');

								opt.setAttribute('data-feedurl',channels[i]['feedurl']);
								opt.setAttribute('data-group',channels[i]['group']);
								opt.innerHTML = channels[i]['title'];// + '<sup>x</sup>';

								opt.appendChild(flt);
								opt.appendChild(del);

								lst.appendChild(opt);
							}
						}
				box.appendChild(lst);
                activebox.appendChild(box);
	    }
	}
        document.getElementById("sidebar").appendChild(activebox);
    }
}

function displaySettings(){


    var dsp = document.createElement('div');
    dsp.setAttribute('id', 'sourcebox');
	var inp = document.createElement('input');
	inp.setAttribute('id', 'sourcestring');
	inp.setAttribute('name', 'sourcestring');
	inp.setAttribute('type', 'text');
	//inp.addEventListener('onchange', sourceinput(this.value) );
    inp.addEventListener("keydown", function (e) {
        if (e.keyCode === 13) {  //checks whether the pressed key is "Enter"
            sourceinput(this.value); //validate(e);
        }
    });

    dsp.appendChild(inp);
    document.getElementById("optionbar").appendChild(dsp);



    var dsp = document.createElement('span');
    dsp.setAttribute('id', 'selectboxfeedmax');
    dsp.setAttribute('class', 'option');
    var box = document.createElement('select');
    box.setAttribute('id', 'feedmax');
    box.setAttribute('onchange', 'reloadBundle();');
    var opt1 = document.createElement('option');
    opt1.innerHTML = '1';
    var opt2 = document.createElement('option');
    opt2.innerHTML = '3';
    var opt3 = document.createElement('option');
    opt3.setAttribute('selected','selected');
    opt3.innerHTML = '5';
    var opt4 = document.createElement('option');
    opt4.innerHTML = '7';
    var opt5 = document.createElement('option');
    opt5.innerHTML = '10';
    box.appendChild(opt1);
    box.appendChild(opt2);
    box.appendChild(opt3);
    box.appendChild(opt4);
    box.appendChild(opt5);
    dsp.appendChild(box);
    dsp.appendChild(document.createTextNode(' items/channel'));
    document.getElementById("optionbar").appendChild(dsp);

    var dsp = document.createElement('label');
    dsp.setAttribute('id', 'selectboxminimize');
    dsp.setAttribute('class', 'option');
    var box = document.createElement('input');
    box.setAttribute('id', 'setminimize');
    box.setAttribute('checked', 'checked');
    box.setAttribute('type', 'checkbox');
    box.setAttribute('onchange', 'reloadBundle();');

    dsp.appendChild(box);

    dsp.appendChild(document.createTextNode(' minimize'));
    document.getElementById("optionbar").appendChild(dsp);
}

function setActiveOptions(){
    if(channels.length > 0){
        var groupmenu = document.getElementById("groupmenu");
        var options = groupmenu.getElementsByTagName('li');
        if(options.length > 0){
            for(i=0;i<options.length;i++){
                var grpnm = options[i].getAttribute('data-name');
                if(checkSubArr(channels,'group',grpnm) == 1){
                    options[i].setAttribute('class', 'active');
                }else{
                    options[i].setAttribute('class', 'nonactive');
                }
            }
        }
        var channelmenu = document.getElementById("groupchannelbox");
        var feedoptions = channelmenu.getElementsByTagName('li');
        if(feedoptions.length > 0){
            for(i=0;i<feedoptions.length;i++){
                var fdurl = feedoptions[i].getAttribute('data-feedurl');
                if(checkSubArr(channels,'feedurl',fdurl) == 1){
                    feedoptions[i].setAttribute('class', 'active');
                }else{
                    feedoptions[i].setAttribute('class', 'nonactive');
                }
            }
        }
    }
}


function toggleChannelFilter(opt){

	//alert(opt.getAttribute('data-feedurl'));
	var url = opt.getAttribute('data-feedurl');
	var chk = checkArr(filterbundle,url);

	if(chk == 1){

		for(var i = filterbundle.length; i--;){
			if (filterbundle[i] === url ){
				filterbundle.splice(i, 1);
				chk = 1; // url is just removed
			}
		}

	}else if(chk == 0){

		filterbundle.push(opt.getAttribute('data-feedurl'));

	}

	reloadBundle();
	console.log(filterbundle);
}


function toggleChannelGroup(group){

	//alert( group.getAttribute('data-name') );

	var grpelms = group.getElementsByTagName('li');

	var tst = 0;
	for(i=0;i<grpelms.length;i++){
		if( grpelms[i].getElementsByTagName('input')[0].checked ){
			tst = 1;
		}
		//console.log(grpelms[i].getElementsByTagName('input')[0].checked);
	}

	for(i=0;i<grpelms.length;i++){

		if(tst == 1){
			grpelms[i].getElementsByTagName('input')[0].checked = false;
		}else{ // add all from filterbundle
			grpelms[i].getElementsByTagName('input')[0].checked = true;
		}

		for(var d = filterbundle.length; d--;){

			if (filterbundle[d] === grpelms[i].getAttribute('data-feedurl') ){
				filterbundle.splice(d, 1);	// remove all from filterbundle
				console.log('removed '+grpelms[i].getAttribute('data-feedurl')+' from filterlist');
			}
		}
		if(tst == 0){ // add all from filterbundle
			filterbundle.push(grpelms[i].getAttribute('data-feedurl'));
			console.log('added '+grpelms[i].getAttribute('data-feedurl')+' to filterlist');
		}

	}
	reloadBundle();
	console.log(filterbundle);


}




function sourceinput(str){

	if( isUrl(str) ){

		var exst = 0;
		if( checkArr(linklibrary, str) == 1) exst = 1;
		if( checkSubArr( archive, 'feedurl', str ) == 1) exst = 1;
		if(exst == 1){

			console.log('Allready listed '+ str);

		}else{

                        validateFeedUrl(str,function(valid){

						if(valid['chk'] == 1){
							// rss feed
							console.log('Adopting RSS '+ str);
                            //addUrlToBundle(str,'new');
                            //filterbundle.push(str);
                            var group = 'custom';
                             var importing = importFeedChannel( str, group, function(newchannel){

                            if(newchannel['items']){

                                for(var c = newchannel['items'].length; c--;){
                                    // add channel info (website url from opml list, not from rss)
                                    //newchannel['items'][c]['website'] = channel['website'];
                                    //newchannel['items'][c]['group'] = group;
                                    //newchannel['items'][c]['feedtitle'] = channel['title'];
                                }
                                for(var i = archive.length; i--;){
                                    if (archive[i]['feedurl'] === str && archive[i]['group'] === group){
                                        archive[i]['items'] = newchannel['items']; // add loaded items to url archive
                                        channel = archive[i];
                                    }
                                }

                                if(newchannel['items'].length > 0){
                                    channels.push(newchannel); // url to channels selection
                                    for(i=0;i<urlmax;i++){
                                        bundle.push(channel['items'][i]); // url items to bundle
                                    }
                                    sortBundle();
                                }

                            }else{

                                alert('Problemo! importing ' + url );

                            }

                            // remove loading class from button..
                            var loadingelements = document.querySelectorAll('[data-feedurl]');
                            for ( var i = 0; i < loadingelements.length; i++ ) {
                                if(loadingelements[i].getAttribute('data-feedurl') == url){
                                    loadingelements[i].classList.remove('loading');
                                }
                            }


                            displayBundle();

                        });






						}else{

                            validateOpmlUrl(str,function(valid){
                                if(valid['chk'] == 1){
                                    // opml
                                    console.log('Adopting opml '+ str);

                                }else{
                                      console.log('Not a valid url: '+ str);

                                }
                            });
                        }

					});


		}

	}else{
		console.log('Not a valid url: '+ str);
	}

}

function searchoptions(){

}


/********* Library ***********/
function isUrl(s) {
var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
return regexp.test(s);
}

function validateOpmlUrl(url,callback){

	var valid = [];

  	if(isUrl(url)){
    	var getdoc = loadXMLHTTP(url,function(doc){
			if( doc.getElementsByTagName("opml") && doc.getElementsByTagName("title")[0].firstChild.nodeValue && doc.getElementsByTagName("outline")){
				valid['chk'] = 1;
				valid['data'] = doc;
			}else{ // no channel title
				valid['chk'] = 'This url might not be a valid OPML url';
			}

			callback( valid );
		});


  	}else{
  		valid['chk'] = 'Should be a valid OPML url';

    	callback( valid );
  	}
}

function validateFeedUrl(url,callback){

	var valid = [];


	if(isUrl(url)){
    	var getdoc = loadXMLHTTP(url, function(doc){

    	if(doc.getElementsByTagName("channel") && doc.getElementsByTagName("title")[0].firstChild.nodeValue && doc.getElementsByTagName("item")){
      		valid['chk'] = 1;
      		valid['data'] = doc;
    	}else{ // no channel title
				valid['chk'] = 'This url might not be a valid feed url';
			}

			callback( valid );
		});


  	}else{
  		valid['chk'] = 'Should be a valid OPML url';

    	callback( valid );
  	}

}


function loadXMLHTTP(url,callback){

	promises++;

	var newRequest = new XMLHttpRequest();
	//newRequest.addEventListener("load", reqListener);
	newRequest.addEventListener("load", function(){

		callback( this.responseXML);

	});

	newRequest.open('GET', 'assets/xmlparser.php?url=' + escape(url));
	newRequest.send();

	console.log('current: '+url);
}


function getImageUrlsFromString(str){

	var tmp = document.createElement('div');
	str = str.replace("<![CDATA[", "").replace("]]>", "");
	tmp.innerHTML = str;
  	var imageTags = tmp.getElementsByTagName("img"); // Returns array of <img> DOM nodes
	var imgurls = [];
	if( imageTags.length > 0 ){
		for (var i in imageTags) {
		   var src = imageTags[i].src;
		   imgurls.push(src);
		}
	}
	if(imgurls[0]){
		return( imgurls );
	}
}

function cleanHtmlText(trunc,l){

	var textlength = 140;
	if(l) textlength = l;

	trunc = strip_html_tags(trunc); // cleanup html tags

	if (trunc.length > textlength) {
		trunc = trunc.substring(0, textlength);
		trunc = trunc.replace(/\w+$/, '');
		trunc = trunc + '..<div class="clr"></div>'
	}
  	return (trunc);
}

function strip_html_tags(str)
{
   if ((str===null) || (str===''))
       return false;
  else
   str = str.toString();
  return str.replace(/<[^>]*>/g, '');
}
//See more at: http://www.w3resource.com/javascript-exercises/javascript-string-exercise-35.php#sthash.lbXbpewT.dpuf




function checkSubArr(arr,subkey,val){ // check if a value exists in a sub array
    var chk = 0;
           if(arr.length > 0){
	       for(var c=0; c<arr.length; c++){ if(arr[c][subkey] === val){ chk = 1; }}
           }
    return chk;
}

function getSubArr(arr,subkey,val){ // check if a value exists in a sub array
           if(arr.length > 0){
	       for(var c=0; c<arr.length; c++){ if(arr[c][subkey] === val){ return arr[c]; }}
           }
   return false;
}

function getArchiveUrl(url,group){
     if(archive.length > 0){
         for(var c=0; c<archive.length; c++){
             if(archive[c]['feedurl'] === url && archive[c]['group'] === group ){
                 return archive[c];
             }
         }
     }
     return false;
}

function checkArr(arr,val){
    var chk = 0;
    for(var c=0; c<arr.length; c++){ if(arr[c] === val){ chk = 1; }}
    return chk;
}


function sortBundle(){ // sort the bundle by pubDate
    // sort bundle by pubDate
    bundle.sort(function(a, b){
        var keyA = new Date(a.pubDate),
	keyB = new Date(b.pubDate);
	// Compare the 2 dates
	if(keyA < keyB) return 1;
	if(keyA > keyB) return -1;
	return 0;
    });
}
