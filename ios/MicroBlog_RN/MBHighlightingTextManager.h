//
//  MBHighlightingTextManager.h
//  MicroBlog_RN
//
//  Created by Manton Reece on 4/16/23.
//

#import <Foundation/Foundation.h>
#import <React/RCTViewManager.h>

@class MBHighlightingTextView;

NS_ASSUME_NONNULL_BEGIN

@interface MBHighlightingTextManager : RCTViewManager <UITextViewDelegate>

@property (strong, nonatomic) id textStorage;
@property (strong, nonatomic) MBHighlightingTextView* textView;
@property (strong, nonatomic) NSTimer* typingTimer;
@property (assign) BOOL isTyping;

+ (CGFloat) preferredTimelineFontSize;
+ (CGFloat) preferredPostingFontSize;

@end

NS_ASSUME_NONNULL_END
