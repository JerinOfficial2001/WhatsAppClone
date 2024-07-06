import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
  Keyboard,
} from 'react-native';
import React, {
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
} from 'react';
import SurfaceLayout from '../src/Layouts/SurfaceLayout';
import {useFocusEffect} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {MyContext} from '../App';
import {GetGroupByID} from '../src/controllers/group';
import Loader from '../src/components/Loader';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';

export default function GroupMsg({navigation, route}) {
  const {Data, jersAppTheme} = useContext(MyContext);
  const {id} = route.params;
  const {
    data: GroupData,
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ['group'],
    queryFn: () =>
      GetGroupByID({id: Data?._id, token: Data?.accessToken, groupID: id}),
    enabled: !!Data && !!Data._id,
  });
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerTitle: () => (
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Image
              source={
                GroupData && GroupData.image && GroupData.image !== 'null'
                  ? {uri: GroupData.image.url}
                  : require('../src/assets/user.png')
              }
              style={{width: 40, height: 40, borderRadius: 15}}
            />
            <TouchableOpacity
              onPress={() => {
                if (GroupData)
                  navigation.navigate('ViewGroupProfile', {
                    id,
                    name: GroupData?.group_name,
                    image:
                      GroupData?.image && GroupData?.image !== 'null'
                        ? GroupData.image.url
                        : null,
                    members: GroupData?.members?.length,
                  });
              }}>
              <View style={{flexDirection: 'column'}}>
                <Text
                  style={{
                    color: jersAppTheme.headerText,
                    fontSize: 20,
                    fontWeight: 'bold',
                  }}>
                  {GroupData ? GroupData.group_name : 'MyGroup'}
                </Text>

                <Text
                  style={{
                    color: jersAppTheme.headerText,
                    fontSize: 10,
                  }}>
                  tab here for group info
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ),
      });
    }, [navigation]),
  );

  const [formDatas, setformDatas] = useState({
    msg: '',
    userName: '',
  });
  const [enableSendBtn, setenableSendBtn] = useState(false);
  const [chatArray, setchatArray] = useState([]);
  const [isMsgLongPressed, setisMsgLongPressed] = useState([]);
  const [isModelOpen, setisModelOpen] = useState(false);
  const [receiverDetails, setreceiverDetails] = useState({});
  const [msgID, setmsgID] = useState('');
  const [isDelete, setisDelete] = useState(false);
  const scrollViewRef = useRef();
  const getTime = timeStamp => {
    const date = new Date(timeStamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + formattedMinutes + ' ' + ampm;
  };
  const BubbleMsg = ({
    text,
    received,
    isSelected,
    handleLongPress,
    handlePress,
    time,
  }) => {
    return (
      <TouchableWithoutFeedback
        onLongPress={handleLongPress}
        onPress={handlePress}>
        <View
          style={{
            minHeight: 60,
            alignItems: received ? 'flex-start' : 'flex-end',
            backgroundColor: isSelected ? '#e9edef0d' : '',
            justifyContent: 'center',
            padding: 5,
            paddingHorizontal: 25,
          }}>
          <View
            style={{
              minWidth: 50,
              backgroundColor: received
                ? jersAppTheme.bubbleReceiverBgColor
                : jersAppTheme.bubbleSenderBgColor,
              borderRadius: 15,
              padding: 5,
              alignItems: 'center',
              justifyContent: 'center',
              borderTopLeftRadius: received ? 0 : 15,
              borderTopEndRadius: received ? 15 : 0,
              paddingVertical: 10,
              flexDirection: 'row',
              gap: 8,
              paddingHorizontal: 10,
            }}>
            <Text
              style={{
                color: received
                  ? jersAppTheme.bubbleReceiverTextColor
                  : jersAppTheme.bubbleSenderTextColor,
              }}>
              {text}
            </Text>
            <View
              style={{
                justifyContent: 'flex-end',
                height: 20,
              }}>
              <Text
                style={{
                  color: received
                    ? jersAppTheme.bubblesReceiverSubTextColor
                    : jersAppTheme.bubblesSenderSubTextColor,
                  fontSize: 10,
                }}>
                {time}
              </Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };
  //  useFocusEffect(
  //    React.useCallback(() => {
  //      if (socket) {
  //        socketUserID(userID ? userID : userData._id);
  //        socketUserConnected({
  //          id: userID ? userID : userData._id,
  //          status: 'online',
  //        });
  //        socketUserWatching({
  //          id: userID ? userID : userData._id,
  //          receiverId,
  //        });
  //        Keyboard.addListener('keyboardDidHide', () => {
  //          socketUserTyped({id: userID ? userID : userData._id, receiverId});
  //        });
  //        Keyboard.addListener('keyboardDidShow', () => {
  //          socketUserTyping({
  //            id: userID ? userID : userData._id,
  //            receiverId,
  //          });
  //          setisTyping(null);
  //        });
  //      }
  //      return () => {
  //        if (socket) {
  //          socketUserWatched({id: userID ? userID : userData._id, receiverId});
  //          setisWatching(null);
  //        }
  //      };
  //    }, [socket]),
  //  );

  useEffect(() => {
    if (formDatas.msg !== '') {
      setenableSendBtn(true);
    } else {
      setenableSendBtn(false);
    }
  }, [formDatas.msg]);

  const handleSubmit = e => {
    e.preventDefault();
    if (formDatas.msg !== '') {
      //  socket.emit('message', {
      //    chatID: chatID,
      //    sender: userData._id,
      //    receiver: id,
      //    message: formDatas.msg,
      //    name: userData.name,
      //  });

      setformDatas({
        msg: '',
        userName: '',
      });
      //  handleSocket();
      Keyboard.dismiss();
    }
  };
  const handleDeleteMsg = () => {
    if (msgID) {
      deleteMessageById(msgID).then(data => {
        if (data.status == 'ok' && data.message == 'deleted') {
          fetchData();
          handlePress();
          setisModelOpen(false);
          ToastAndroid.show('Message Deleted', ToastAndroid.SHORT);
        } else {
          setisModelOpen(false);
          ToastAndroid.show('Failed', ToastAndroid.SHORT);
        }
      });
    }
  };
  const handleSocket = async () => {
    if (socket) {
      socket.on('message', data => {
        if (chatID && data) {
          const filteredMsg = data.filter(msg => msg.chatID == chatID);
          if (filteredMsg) {
            setchatArray(
              filteredMsg.map(elem => ({
                ...elem,
                time: getTime(elem.createdAt),
              })),
            );
          }
        }
      });
    }
  };
  const handleOnchange = (value, name) => {
    setformDatas(prev => ({...prev, [name]: value}));
  };
  const handleLongPress = (index, id) => {
    const updatedStates = [...isMsgLongPressed];
    updatedStates[index].isSelected = true;
    setisMsgLongPressed(updatedStates);
    setmsgID(id);
    setisDelete(true);
  };
  const handlePress = () => {
    const updatedStates = isMsgLongPressed?.map(() => ({isSelected: false}));
    setisMsgLongPressed(updatedStates);
    setisDelete(false);
  };
  const handleModelClose = () => {
    setisModelOpen(false);
    handlePress();
  };
  const styles = StyleSheet.create({
    backgroundImage: {
      height: '100%', // Make sure the image takes the entire screen
      resizeMode: 'cover', // Resize the image to cover the entire container
      justifyContent: 'center', // Center the content inside the container
      position: 'relative',
    },
    content: {
      flexDirection: 'column-reverse',
      padding: 10,
      gap: 2,
    },
    inputContainer: {
      marginBottom: 10,
      marginTop: 10,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 3,
    },
    messageCardContainer: {
      marginVertical: 3,
      width: 'auto',
    },
    messageCardtext: {
      backgroundColor: '#064e49',
      width: 'auto',
    },
    sendBtn: {
      backgroundColor: jersAppTheme.appBar,
      padding: 10,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  const messages = [];
  return (
    <SurfaceLayout>
      {isLoading ? (
        <Loader />
      ) : messages.length > 0 ? (
        <FlatList
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({animated: true});
          }}
          ref={scrollViewRef}
          scrollEnabled
          data={chatArray}
          contentContainerStyle={{
            paddingBottom: 0,
            //   paddingBottom: UserWatching ? 40 : 0,
          }}
          renderItem={({item, index}) => (
            <BubbleMsg
              text={item.message}
              time={item.time}
              received={item.sender !== userData._id}
              isSelected={isMsgLongPressed[index]?.isSelected}
              handlePress={handlePress}
              handleLongPress={() => {
                handleLongPress(index, item._id);
              }}
            />
          )}
          keyExtractor={item => item._id}
        />
      ) : (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <FastImage
            style={{width: 400, height: 400, opacity: 0.3}}
            source={require('../src/assets/gifs/Chat.gif')}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Message"
          style={{
            backgroundColor: jersAppTheme.selectedColor,
            color: jersAppTheme.title,
            borderRadius: 30,
            width: enableSendBtn ? '80%' : '95%',
            padding: 13,
          }}
          value={formDatas.msg ? formDatas.msg : ''}
          onChangeText={value => {
            handleOnchange(value, 'msg');
          }}
          placeholderTextColor={jersAppTheme.placeholderColor}
        />
        {enableSendBtn && (
          <TouchableOpacity onPress={handleSubmit} style={styles.sendBtn}>
            <IoniconsIcon
              size={25}
              name="send"
              color={jersAppTheme.headerText}
            />
          </TouchableOpacity>
        )}
      </View>
    </SurfaceLayout>
  );
}
