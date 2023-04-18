//
//  MBHighlightingTextView.h
//  MicroBlog_RN
//
//  Created by Manton Reece on 4/16/23.
//

#import <UIKit/UIKit.h>
#import <React/RCTViewManager.h>

NS_ASSUME_NONNULL_BEGIN

@interface MBHighlightingTextView : UITextView

@property (nonatomic, copy) RCTBubblingEventBlock onChangeText;
@property (nonatomic, copy) RCTBubblingEventBlock onSelectionChange;

- (void) callTextChanged:(NSString *)text;
- (void) callSelectionChanged;

@end

NS_ASSUME_NONNULL_END
